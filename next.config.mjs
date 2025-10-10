/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        process: false,
      }
    }
    
    // Handle Radix UI and other UI libraries
    config.externals = config.externals || []
    if (isServer) {
      config.externals.push({
        '@radix-ui/react-accordion': 'commonjs @radix-ui/react-accordion',
        '@radix-ui/react-alert-dialog': 'commonjs @radix-ui/react-alert-dialog',
        '@radix-ui/react-avatar': 'commonjs @radix-ui/react-avatar',
        '@radix-ui/react-checkbox': 'commonjs @radix-ui/react-checkbox',
        '@radix-ui/react-collapsible': 'commonjs @radix-ui/react-collapsible',
        '@radix-ui/react-dialog': 'commonjs @radix-ui/react-dialog',
        '@radix-ui/react-dropdown-menu': 'commonjs @radix-ui/react-dropdown-menu',
        '@radix-ui/react-hover-card': 'commonjs @radix-ui/react-hover-card',
        '@radix-ui/react-label': 'commonjs @radix-ui/react-label',
        '@radix-ui/react-menubar': 'commonjs @radix-ui/react-menubar',
        '@radix-ui/react-navigation-menu': 'commonjs @radix-ui/react-navigation-menu',
        '@radix-ui/react-popover': 'commonjs @radix-ui/react-popover',
        '@radix-ui/react-progress': 'commonjs @radix-ui/react-progress',
        '@radix-ui/react-radio-group': 'commonjs @radix-ui/react-radio-group',
        '@radix-ui/react-scroll-area': 'commonjs @radix-ui/react-scroll-area',
        '@radix-ui/react-select': 'commonjs @radix-ui/react-select',
        '@radix-ui/react-separator': 'commonjs @radix-ui/react-separator',
        '@radix-ui/react-sheet': 'commonjs @radix-ui/react-sheet',
        '@radix-ui/react-slider': 'commonjs @radix-ui/react-slider',
        '@radix-ui/react-switch': 'commonjs @radix-ui/react-switch',
        '@radix-ui/react-tabs': 'commonjs @radix-ui/react-tabs',
        '@radix-ui/react-toast': 'commonjs @radix-ui/react-toast',
        '@radix-ui/react-toggle': 'commonjs @radix-ui/react-toggle',
        '@radix-ui/react-toggle-group': 'commonjs @radix-ui/react-toggle-group',
        '@radix-ui/react-tooltip': 'commonjs @radix-ui/react-tooltip',
        'xlsx': 'commonjs xlsx',
      })
    }
    
    return config
  },
}

export default nextConfig
