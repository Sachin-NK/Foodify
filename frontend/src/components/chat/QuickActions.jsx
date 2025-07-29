/**
 * QuickActions Component
 * Predefined action buttons for common tasks
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MapPin, 
  ShoppingCart, 
  Clock, 
  User, 
  HelpCircle,
  Phone,
  Filter,
  Star,
  CreditCard
} from 'lucide-react';

const QuickActions = ({ 
  actions = [], 
  onActionClick, 
  className = '',
  maxVisible = 6 
}) => {
  // Icon mapping for different action types
  const getActionIcon = (action) => {
    const iconMap = {
      navigate: <MapPin className="h-3 w-3" />,
      search: <Search className="h-3 w-3" />,
      show_filters: <Filter className="h-3 w-3" />,
      location_search: <MapPin className="h-3 w-3" />,
      menu_help: <Star className="h-3 w-3" />,
      delivery_info: <Clock className="h-3 w-3" />,
      checkout_help: <CreditCard className="h-3 w-3" />,
      modify_order: <ShoppingCart className="h-3 w-3" />,
      track_order: <Clock className="h-3 w-3" />,
      contact_delivery: <Phone className="h-3 w-3" />,
      login_help: <User className="h-3 w-3" />,
      register_help: <User className="h-3 w-3" />,
      account_help: <User className="h-3 w-3" />,
      order_history: <Clock className="h-3 w-3" />,
      contact_support: <Phone className="h-3 w-3" />,
      faq: <HelpCircle className="h-3 w-3" />,
    };

    return iconMap[action.action] || <HelpCircle className="h-3 w-3" />;
  };

  // Limit visible actions
  const visibleActions = actions.slice(0, maxVisible);

  if (visibleActions.length === 0) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    }
  };

  return (
    <div className={`border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 ${className}`}>
      <div className="p-3">
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
          Quick Actions
        </div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap gap-2"
        >
          {visibleActions.map((action) => (
            <motion.div
              key={action.id}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-orange-50 hover:border-orange-200 dark:hover:bg-orange-900/20 dark:hover:border-orange-700 text-xs transition-all duration-200 flex items-center space-x-1 py-1 px-2"
                onClick={() => onActionClick(action)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onActionClick(action);
                  }
                }}
                aria-label={`Quick action: ${action.label}`}
              >
                {getActionIcon(action)}
                <span>{action.label}</span>
              </Badge>
            </motion.div>
          ))}
        </motion.div>

        {actions.length > maxVisible && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            +{actions.length - maxVisible} more actions available
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickActions;