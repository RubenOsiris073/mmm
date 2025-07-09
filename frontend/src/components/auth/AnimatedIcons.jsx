import React from 'react';
import { motion } from 'framer-motion';
import { Banknote, User } from 'lucide-react';

// Icono animado de dinero/billete
export const AnimatedMoneyIcon = ({ size = 24 }) => {
  return (
    <motion.div
      whileHover={{ 
        scale: 1.1,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.95 }}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
        }}
        transition={{ duration: 0.3 }}
        whileHover={{
          y: [0, -2, 0],
          transition: { 
            y: { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
          }
        }}
      >
        <motion.div
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(13, 110, 253, 0.4)',
              '0 0 0 8px rgba(13, 110, 253, 0)',
            ],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Banknote 
            size={size} 
            style={{ 
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// Icono animado de usuario/administración
export const AnimatedUserIcon = ({ size = 24 }) => {
  return (
    <motion.div
      whileHover={{ 
        scale: 1.1,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.95 }}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
        }}
        transition={{ duration: 0.3 }}
        whileHover={{
          y: [0, -2, 0],
          transition: { 
            y: { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
          }
        }}
      >
        <motion.div
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(220, 53, 69, 0.4)',
              '0 0 0 8px rgba(220, 53, 69, 0)',
            ],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <User 
            size={size} 
            style={{ 
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
