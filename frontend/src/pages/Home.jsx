import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowRight, Truck, Utensils, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1920&h=1080&q=80"
            alt="Food collage"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-8xl font-bold text-white mb-6 font-sans"
          >
            Welcome to
            <span className="text-yellow-300 block">Foodify</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-white mb-8"
          >
            Discover amazing food from the best restaurants near you
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/browse">
              <Button className="bg-white text-black px-8 py-4 rounded-lg font-semibold text-lg special-button button-bounce">
                Browse Restaurants
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-2 border-white text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-orange-500 transition-colors button-bounce float-animation"
            >
              Become a Partner
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-center mb-12 font-sans text-gray-800"
          >
            Why Choose Foodify?
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Truck className="h-8 w-8 text-white" />,
                title: "Fast Delivery",
                description: "Get your food delivered in 30 minutes or less",
                color: "bg-orange-500"
              },
              {
                icon: <Utensils className="h-8 w-8 text-white" />,
                title: "Quality Food",
                description: "Fresh ingredients from the best restaurants",
                color: "bg-green-500"
              },
              {
                icon: <Smartphone className="h-8 w-8 text-white" />,
                title: "Easy Ordering",
                description: "Simple and intuitive ordering experience",
                color: "bg-blue-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="text-center card-hover p-6">
                  <CardContent className="pt-6">
                    <div className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2 font-sans">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
