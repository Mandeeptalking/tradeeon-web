import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Zap, Target, Shield, ArrowRight, CheckCircle } from 'lucide-react';

const GetStarted = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const steps = [
    {
      icon: Bot,
      title: 'Choose Your Bot',
      description: 'Select from our library of proven trading strategies or create your custom bot with our drag-and-drop builder.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Target,
      title: 'Set Parameters',
      description: 'Define your risk tolerance, trading pairs, and profit targets with our intuitive configuration panel.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Zap,
      title: 'Deploy & Profit',
      description: 'Launch your bot and watch it execute trades 24/7 with lightning-fast precision and real-time analytics.',
      color: 'from-emerald-500 to-green-500'
    }
  ];

  const features = [
    'AI-Powered Market Analysis',
    'Risk Management Tools',
    'Real-time Portfolio Tracking',
    '24/7 Automated Trading',
    'Advanced Analytics Dashboard',
    'Multi-Exchange Support'
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Get Started in
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              3 Simple Steps
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Launch your first trading bot in minutes, not hours. Our platform makes automated trading accessible to everyone.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group relative"
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className={`relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 h-full transform transition-all duration-500 ${
                hoveredCard === index 
                  ? 'scale-105 rotate-1 shadow-2xl shadow-purple-500/20' 
                  : 'hover:scale-102'
              }`}
              style={{
                transformStyle: 'preserve-3d',
                transform: hoveredCard === index 
                  ? 'perspective(1000px) rotateY(-5deg) rotateX(5deg) scale(1.05)' 
                  : 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)'
              }}>
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-gray-600 shadow-lg">
                  {index + 1}
                </div>

                {/* Icon with Animation */}
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl mb-6 transform transition-all duration-300 ${
                  hoveredCard === index ? 'rotate-12 scale-110' : ''
                }`}>
                  <step.icon className="h-8 w-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                  {step.title}
                </h3>

                <p className="text-gray-400 leading-relaxed">
                  {step.description}
                </p>

                {/* Hover Effect Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-r ${step.color} opacity-0 rounded-2xl transition-opacity duration-300 ${
                  hoveredCard === index ? 'opacity-10' : ''
                }`}></div>
              </div>

              {/* Connection Line (except for last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-4 -translate-y-1/2">
                  <ArrowRight className="h-6 w-6 text-gray-600 animate-pulse" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Features List */}
            <div>
              <h3 className="text-3xl font-bold text-white mb-8">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Everything You Need
                </span>
                <br />
                <span className="text-white">To Succeed</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3 group">
                    <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-300 group-hover:text-white transition-colors duration-300">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - CTA */}
            <div className="text-center lg:text-right">
              <div className="relative inline-block">
                {/* Glowing effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                
                <button className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 hover:from-blue-600 hover:via-purple-600 hover:to-emerald-600 text-white px-12 py-6 rounded-full font-bold text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl overflow-hidden group">
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    <span>Start Your Free Trial</span>
                    <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
              
              <p className="text-gray-400 mt-4">
                No credit card required • 14-day free trial
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GetStarted;