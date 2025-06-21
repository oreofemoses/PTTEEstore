import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

const getTransformedImageUrl = (url, options) => {
	if (!url) {
		return null;
	}
	
	// Default to contain to prevent cropping, unless specified otherwise
	const { width, height, resize = 'contain' } = options || {};

	// This is a basic implementation. For production, you might want a more robust URL parser.
	// Example Supabase URL: https://<project-id>.supabase.co/storage/v1/object/public/<bucket-name>/<image-path>
	// We want to transform it to: https://<project-id>.supabase.co/storage/v1/render/image/public/<bucket-name>/<image-path>?width=<width>&height=<height>&resize=contain

	try {
		const urlObject = new URL(url);
		const pathSegments = urlObject.pathname.split('/');
		
		// Find the 'object' segment and replace it with 'render/image'
		const objectIndex = pathSegments.indexOf('object');
		if (objectIndex === -1) {
			// Not a standard Supabase storage URL, return original
			return url;
		}

		pathSegments.splice(objectIndex, 1, 'render', 'image');
		urlObject.pathname = pathSegments.join('/');
		
		// Add transformation parameters
		if (width) urlObject.searchParams.set('width', width);
		if (height) urlObject.searchParams.set('height', height);
		if (resize) urlObject.searchParams.set('resize', resize);
		
		return urlObject.toString();
	} catch (error) {
		console.error("Failed to transform image URL:", error);
		return url; // Return original URL on error
	}
};

export { getTransformedImageUrl };