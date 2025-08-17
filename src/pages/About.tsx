/**
 * About Page
 * Information about ClinicalRxQ, mission, team, and company details
 */

import React from 'react'
import Header from '../components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Link } from 'react-router'
import { Users, Award, Target, Heart } from 'lucide-react'

/**
 * About Page Component
 */
const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F9FB] to-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-cyan-600 to-teal-500 text-white py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative z-10 mx-auto max-w-[1200px] px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">About ClinicalRxQ</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Transforming community pharmacy from product-centric dispensaries into 
              patient-centered healthcare hubs through comprehensive training and resources.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-0 mb-4">
                OUR MISSION
              </Badge>
              <h2 className="text-3xl font-bold mb-6">
                Empowering Community Pharmacists
              </h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                ClinicalRxQ was founded to address the critical need for standardized, 
                evidence-based clinical pharmacy services in community settings. We provide 
                comprehensive training, protocols, and documentation systems that enable 
                pharmacies to deliver enhanced patient care services.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Evidence-Based Protocols</p>
                    <p className="text-gray-600 text-sm">
                      All resources developed using current clinical guidelines and best practices
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Team-Based Approach</p>
                    <p className="text-gray-600 text-sm">
                      Comprehensive training for both pharmacists and pharmacy technicians
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Heart className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Patient-Centered Care</p>
                    <p className="text-gray-600 text-sm">
                      Focus on improving patient outcomes through enhanced pharmacy services
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://pub-cdn.sider.ai/u/U0X7H845ROR/web-coder/689cc75ea616cfbf06746dc2/resource/b497dbb6-85a1-4546-9fda-3e4492cb21d6.jpg" 
                alt="Pharmacy team collaboration"
                className="rounded-2xl shadow-2xl object-cover w-full h-full"
              />
              <div className="absolute -top-4 -right-4 w-full h-full bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-300 rounded-2xl opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do at ClinicalRxQ
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Excellence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We maintain the highest standards in clinical content, training materials, 
                  and customer support.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-cyan-100 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-cyan-600" />
                </div>
                <CardTitle>Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We believe in the power of teamwork and work closely with pharmacy 
                  professionals to develop practical solutions.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-teal-600" />
                </div>
                <CardTitle>Compassion</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We are driven by a genuine desire to improve patient care and support 
                  community pharmacists in their vital role.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="mx-auto max-w-[1200px] px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Become part of the growing network of pharmacies transforming patient care 
            through ClinicalRxQ's comprehensive programs.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/join">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="bg-transparent">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage