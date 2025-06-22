// Optimización para desarrollo rápido
const path = require('path');

module.exports = {
  // Configuración de caché para builds más rápidos
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
  },
  
  // Optimización de resolución de módulos
  resolve: {
    // Alias para imports más rápidos
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@pages': path.resolve(__dirname, 'src/pages'),
    },
    // Extensiones de archivo
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    // Módulos prioritarios
    modules: [
      path.resolve(__dirname, 'src'),
      'node_modules',
    ],
  },
  
  // Optimización para desarrollo
  optimization: {
    // Solo en desarrollo - código más rápido
    splitChunks: process.env.NODE_ENV === 'development' ? false : {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        firebase: {
          test: /[\\/]node_modules[\\/]firebase[\\/]/,
          name: 'firebase',
          chunks: 'all',
        },
        bootstrap: {
          test: /[\\/]node_modules[\\/](bootstrap|react-bootstrap)[\\/]/,
          name: 'bootstrap',
          chunks: 'all',
        },
      },
    },
    // Minimización solo en producción
    minimize: process.env.NODE_ENV === 'production',
  },
  
  // Configuración del devServer para desarrollo más rápido
  devServer: {
    hot: true,
    liveReload: false, // Solo usar HMR
    compress: true,
    historyApiFallback: true,
    client: {
      overlay: {
        errors: true,
        warnings: false, // Ocultar warnings en overlay para performance
      },
    },
  },
  
  // Configuración de performance
  performance: {
    hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
};