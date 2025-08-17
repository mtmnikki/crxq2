/**
 * Contact Page
 * Contact form and company information
 */

import React from 'react'
import Header from '../components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Link } from 'react-router'
import { Mail, Phone, MapPin, Send } from 'lucide-react'

/**
 * Contact Page Component
 */
const ContactPage: React.FC = () => {
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
            <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Have questions about ClinicalRxQ? We're here to help you transform your pharmacy practice.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Send us a message</h2>
              <Card>
                <CardContent className="p-6">
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="John" />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Doe" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" placeholder="john@example.com" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" placeholder="(555) 123-4567" />
                    </div>
                    <div>
                      <Label htmlFor="pharmacy">Pharmacy Name</Label>
                      <Input id="pharmacy" placeholder="Sunrise Community Pharmacy" />
                    </div>
                    <div>
                      <Label htmlFor="message">Message</Label>
                      <textarea
                        id="message"
                        rows={4}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="How can we help you?"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600">
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Get in touch</h2>
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Mail className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Email Us</h3>
                        <p className="text-gray-600 mb-2">
                          For general inquiries and support
                        </p>
                        <a href="mailto:info@clinicalrxq.com" className="text-blue-600 hover:underline">
                          info@clinicalrxq.com
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                        <Phone className="h-6 w-6 text-cyan-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Call Us</h3>
                        <p className="text-gray-600 mb-2">
                          Monday - Friday, 9:00 AM - 5:00 PM CST
                        </p>
                        <a href="tel:1-800-CLINICAL" className="text-blue-600 hover:underline">
                          1-800-CLINICAL
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-6 w-6 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Visit Us</h3>
                        <p className="text-gray-600 mb-2">
                          Our headquarters and training center
                        </p>
                        <address className="text-gray-700 not-italic">
                          123 Healthcare Way<br />
                          Medical District, MD 12345
                        </address>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Links */}
              <div className="mt-8">
                <h3 className="font-semibold mb-4">Quick Links</h3>
                <div className="space-y-2">
                  <Link to="/programs" className="block text-blue-600 hover:underline">
                    Explore Our Programs
                  </Link>
                  <Link to="/join" className="block text-blue-600 hover:underline">
                    Start Your Free Trial
                  </Link>
                  <Link to="/login" className="block text-blue-600 hover:underline">
                    Member Login
                  </Link>
                  <Link to="/about" className="block text-blue-600 hover:underline">
                    Learn More About Us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ContactPage