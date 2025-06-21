
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); 
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);

  const fetchFullUserProfile = async (userId) => {
    if (!userId) {
      setProfile(null);
      setIsAdmin(false);
      return null;
    }
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select('*') 
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching full user profile:', { message: error.message, details: error.details, code: error.code });
        setProfile(null); 
        setIsAdmin(false);
        
        if (error.code !== 'PGRST116') { 
          toast({
            title: "Error fetching profile data",
            description: "Could not load complete user details: " + error.message,
            variant: "destructive",
          });
        }
        return null;
      }
      
      setProfile(data); 
      setIsAdmin(data?.role === 'admin');
      return data;

    } catch (error) {
      console.error('Unexpected error fetching full user profile:', error);
      setProfile(null);
      setIsAdmin(false);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading user details.",
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          await fetchFullUserProfile(currentUser.id);
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
        setLoading(false);
        setInitialAuthCheckComplete(true);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
      setLoading(false);
      return { success: false, error: error.message };
    }
    if (data.user) {
      toast({ title: "Welcome back!", description: "You've successfully logged in." });
    }
    setLoading(false);
    return { success: true, user: data.user, profile: profile }; 
  };

  const register = async (email, password, name, phone_number, address) => {
    setLoading(true);
    const userMetadata = { full_name: name };
    if (phone_number) userMetadata.phone = phone_number;
    if (address) userMetadata.address = address;

    const { data, error } = await supabase.auth.signUp({
      email, password, options: { data: userMetadata }
    });

    if (error) {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again with different details.",
        variant: "destructive",
      });
      setLoading(false);
      return { success: false, error: error.message };
    }
    
    if (data.user) {
      toast({
        title: "Account Created! Check Your Email",
        description: "A confirmation email has been sent to your address.",
        duration: 10000, 
      });
    }
    setLoading(false);
    return { success: true, user: data.user, profile: null }; 
  };

  const logout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Logout failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Logged out", description: "See you next time!" });
    }
    setLoading(false);
  };

  const updateUserProfile = async (profileUpdateData, avatarFile = null) => {
    if (!user) return { success: false, error: 'User not authenticated.' };
    setLoading(true);
    
    let avatarPublicUrl = profile?.avatar_url || user.user_metadata?.avatar_url;

    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}.${Date.now()}.${fileExt}`; 
      const filePath = `${fileName}`; 

      if (profile?.avatar_url) {
        try {
          const oldPathParts = profile.avatar_url.split('/');
          const oldStoragePath = oldPathParts.slice(oldPathParts.indexOf('profile-pictures') + 1).join('/');
          if (oldStoragePath) { 
             await supabase.storage.from('profile-pictures').remove([oldStoragePath]);
          }
        } catch(e) {
          console.warn("Could not remove old avatar.", e.message);
        }
      }

      const { error: uploadError } = await supabase.storage.from('profile-pictures').upload(filePath, avatarFile);
      if (uploadError) {
        toast({ title: "Avatar Upload Error", description: uploadError.message, variant: "destructive" });
        setLoading(false);
        return { success: false, error: uploadError.message };
      }
      const { data: { publicUrl } } = supabase.storage.from('profile-pictures').getPublicUrl(filePath);
      avatarPublicUrl = publicUrl;
    }

    const { data: authUserData, error: authError } = await supabase.auth.updateUser({
      data: { full_name: profileUpdateData.name, phone: profileUpdateData.phone, address: profileUpdateData.address, avatar_url: avatarPublicUrl }
    });

    if (authError) {
      toast({ title: "Auth Update Failed", description: authError.message, variant: "destructive" });
      setLoading(false);
      return { success: false, error: authError.message };
    }
    
    const profileTableUpdateData = {
      full_name: profileUpdateData.name, phone_number: profileUpdateData.phone, address: profileUpdateData.address, avatar_url: avatarPublicUrl,
    };

    const { data: updatedProfile, error: profileError } = await supabase
      .from('profiles').update(profileTableUpdateData).eq('id', user.id).select().single();

    if (profileError) {
       toast({ title: "Profile Update Failed", description: profileError.message, variant: "destructive" });
    } else if (updatedProfile) {
      setProfile(updatedProfile); 
      setUser(prevUser => ({...prevUser, user_metadata: authUserData.user.user_metadata})); 
      toast({ title: "Profile Updated!", description: "Your information has been saved." });
    }

    setLoading(false);
    return { success: !profileError, data: updatedProfile, error: profileError?.message };
  };

  const value = {
    user, profile, isAdmin, login, register, logout, loading, initialAuthCheckComplete, updateUserProfile, fetchFullUserProfile, 
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
