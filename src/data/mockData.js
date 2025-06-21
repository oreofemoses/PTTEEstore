// This file is no longer used for core product data, but is kept for reference or potential fallback.
// All product data is now fetched from Supabase.
export const mockProducts = [];

export const mockCustomDesigns = [
  {
    id: 'custom-1',
    userId: 'user-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    description: 'A dragon breathing rainbow fire with mountains in the background',
    status: 'Mockup Ready',
    submittedAt: '2024-01-15T10:30:00Z',
    shirtColor: 'Black',
    shirtStyle: 'Classic Tee',
    referenceImages: [],
    adminNotes: 'Mockup completed, awaiting customer approval',
    mockups: [
      { id: 'mockup-1-1', url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&h=300&fit=crop', name: 'Dragon Design A', price: 55 },
      { id: 'mockup-1-2', url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop', name: 'Dragon Design B (Subtle)', price: 50 },
      { id: 'mockup-1-3', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop', name: 'Dragon Design C (Minimalist)', price: 48 },
    ]
  },
  {
    id: 'custom-2',
    userId: 'user-2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    description: 'Minimalist cat silhouette with geometric patterns',
    status: 'Under Review',
    submittedAt: '2024-01-14T14:20:00Z',
    shirtColor: 'White',
    shirtStyle: 'V-Neck',
    referenceImages: [],
    adminNotes: '',
    mockups: []
  },
  {
    id: 'custom-3',
    userId: 'user-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    description: 'A cyberpunk cityscape at night, with neon lights reflecting on wet streets. Focus on a lone figure in a trench coat.',
    status: 'In Progress',
    submittedAt: '2024-01-18T09:00:00Z',
    shirtColor: 'Dark Navy',
    shirtStyle: 'Long Sleeve',
    referenceImages: ['https://images.unsplash.com/photo-15189439192Pr?w=200'],
    adminNotes: 'Gathering assets for cityscape. Considering different perspectives for the lone figure.',
    mockups: []
  }
];

export const mockOrders = [
  {
    id: 'order-1',
    userId: 'user-1',
    items: [
      {
        productId: '1',
        name: 'Cosmic Dreams',
        price: 45,
        size: 'M',
        color: 'Black',
        quantity: 1
      }
    ],
    total: 45,
    status: 'Completed',
    createdAt: '2024-01-10T09:15:00Z',
    shippingAddress: {
      name: 'John Doe',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    }
  }
];