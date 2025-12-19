"use client";

import { motion } from "motion/react";
import Link from "next/link";
import {
  IceCream,
  Sparkles,
  Clock,
  Shield,
  Heart,
  ArrowRight,
  Leaf,
  Award,
  Zap,
} from "lucide-react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { gradientText } from "@/lib/utils/gradientTxt";
import { productsApi } from "@/lib/api/products";
import { useEffect, useState } from "react";

const features = [
  {
    icon: IceCream,
    title: "100% Fruit-Based",
    description:
      "Made with real fruits, no artificial flavors or preservatives",
    color: "text-primary-500",
  },
  {
    icon: Leaf,
    title: "Fresh & Natural",
    description: "Sourced daily from local farms for maximum freshness",
    color: "text-secondary-500",
  },
  {
    icon: Heart,
    title: "Health First",
    description: "Low calorie, high nutrition desserts that taste amazing",
    color: "text-accent-500",
  },
  {
    icon: Clock,
    title: "Quick Delivery",
    description: "Fast delivery to keep your treats fresh and cool",
    color: "text-info",
  },
  {
    icon: Shield,
    title: "Quality Assured",
    description: "Hygienic preparation following strict quality standards",
    color: "text-success",
  },
  {
    icon: Award,
    title: "Award Winning",
    description: "Recognized for excellence in fruit-based desserts",
    color: "text-warning",
  },
];

const testimonials = [
  {
    name: "Priya Sharma",
    text: "Best fruit ice cream I've ever had! The mango variant is absolutely divine!",
    rating: 5,
  },
  {
    name: "Rahul Kumar",
    text: "Healthy and delicious! My kids love it and I feel good about giving it to them.",
    rating: 5,
  },
  {
    name: "Anita Desai",
    text: "Amazing flavors, quick delivery, and great prices. Highly recommended!",
    rating: 5,
  },
];

export default function LandingPage() {
  const [prodData, setProdData] = useState<any>();
  const handleGet = async () => {
    try {
      const data = await productsApi().getAll({
        page: 1,
        limit: 20,
        categoryId: "69417d8f0b49086f43d85204",
        isAvailable: true,
      });
      setProdData(data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    handleGet();
  }, []);
  console.log("data", prodData);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-secondary-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-20 pb-32">
        <div className="relative mx-auto max-w-7xl">
          <div className="text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-2 text-white shadow-glow"
            >
              <Sparkles size={16} className="animate-pulse-glow" />
              <span className="text-sm font-medium">
                Fruit Fuelled! #dessy69
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-6 text-5xl font-bold leading-tight md:text-6xl lg:text-7xl"
            >
              <span className={gradientText.primary}>Dessy69 Cafe</span>
              <br />
              <span className="text-neutral-900 dark:text-neutral-100">
                Fruit-Based Ice Creams
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto mb-10 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400"
            >
              Indulge in nature's sweetness with our artisanal fruit-based ice
              creams and desserts. Handcrafted with love, delivering pure joy in
              every scoop! 🍨✨
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col gap-4 sm:flex-row sm:justify-center"
            >
              <Link href="/menu">
                <Button
                  size="lg"
                  className="group w-full sm:w-auto flex"
                  rightIcon={
                    <ArrowRight
                      size={20}
                      className="ml-2 transition-transform group-hover:translate-x-1"
                    />
                  }
                >
                  Explore Menu
                </Button>
              </Link>
              <Link href="/menu">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                  rightIcon={<Zap size={20} className="mr-2" />}
                >
                  Order Now
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-16 grid grid-cols-3 gap-8"
            >
              <div>
                <div className="text-4xl font-bold text-gradient-primary">
                  50+
                </div>
                <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  Fruit Flavors
                </div>
              </div>
              <div>
                <div className="text-4xl font-bold text-gradient-secondary">
                  10k+
                </div>
                <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  Happy Customers
                </div>
              </div>
              <div>
                <div className="text-4xl font-bold text-gradient-accent">
                  4.9★
                </div>
                <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  Average Rating
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold">Why Choose Dessy69?</h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              Experience the perfect blend of health and taste
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card hover className="h-full p-6">
                  <div
                    className={`mb-4 inline-flex rounded-2xl bg-gradient-to-br p-3 ${feature.color} bg-opacity-10`}
                  >
                    <feature.icon size={32} className={feature.color} />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-neutral-100 px-4 py-20 dark:bg-neutral-900">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold">What Our Customers Say</h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              Loved by thousands across the city
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full p-6">
                  <div className="mb-4 flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <span key={i} className="text-warning">
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="mb-4 text-neutral-700 dark:text-neutral-300">
                    "{testimonial.text}"
                  </p>
                  <p className="font-semibold">{testimonial.name}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl bg-gradient-primary p-12 text-white shadow-glow"
          >
            <h2 className="mb-4 text-4xl font-bold">
              Ready to Experience Bliss?
            </h2>
            <p className="mb-8 text-lg opacity-90">
              Order now and get your favorite fruit-based treats delivered fresh
              to your doorstep!
            </p>
            <Link href="/menu">
              <Button
                size="lg"
                className="bg-white text-primary-500 hover:bg-neutral-100"
                leftIcon={<IceCream size={20} className="mr-2" />}
              >
                Start Ordering
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
