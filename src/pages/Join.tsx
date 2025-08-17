/**
 * Join Page
 * Sign-up form for new members requesting access to ClinicalRxQ
 */

import React, { useState } from 'react'
import Header from '../components/layout/Header'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Link } from 'react-router'
import { 
  CheckCircle, 
  Shield, 
  Users, 
  FileText, 
  ArrowRight,
  Mail,
  Phone,
  Building,
  MapPin
} from 'lucide-react'

/**
 * Join Page Component
 */
const JoinPage: React.FC = () => {
  const [formData, setFormData] = useState({
    pharmacyName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    currentServices: [] as string[]
  })

  const services = [
    'Medication Synchronization',
    'MTM Services',
    'Immunizations',
    'Point-of-Care Testing',
    'Durable Medical Equipment',
    'Compounding',
    'Other'
  ]

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      currentServices: prev.currentServices.includes(service)
        ? prev.currentServices.filter(s => s !== service)
        : [...prev.currentServices, service]
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
  }

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
            <h1 className="text-4xl font-bold mb-4">Start Your Free Trial</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Join hundreds of pharmacies transforming their practice with ClinicalRxQ's 
              comprehensive clinical programs and resources.
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Request Access</CardTitle>
                  <p className="text-gray-600">
                    Fill out the form below to request access to ClinicalRxQ. We'll review 
                    your information and get back to you within 1-2 business days.
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Pharmacy Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Pharmacy Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="pharmacyName">Pharmacy Name *</Label>
                          <Input
                            id="pharmacyName"
                            value={formData.pharmacyName}
                            onChange={(e) => setFormData(prev => ({ ...prev, pharmacyName: e.target.value }))}
                            placeholder="Sunrise Community Pharmacy"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="contactName">Contact Person *</Label>
                          <Input
                            id="contactName"
                            value={formData.contactName}
                            onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                            placeholder="John Doe"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="john@example.com"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="(555) 123-4567"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="address">Street Address</Label>
                          <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                            placeholder="123 Main St"
                          />
                        </div>
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                            placeholder="Anytown"
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={formData.state}
                            onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                            placeholder="CA"
                          />
                        </div>
                        <div>
                          <Label htmlFor="zip">ZIP Code</Label>
                          <Input
                            id="zip"
                            value={formData.zip}
                            onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value }))}
                            placeholder="12345"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Current Services */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Current Services Offered</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {services.map((service) => (
                          <label key={service} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.currentServices.includes(service)}
                              onChange={() => handleServiceToggle(service)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm">{service}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600">
                      Request Access
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Benefits Sidebar */}
            <div>
              <h3 className="text-xl font-semibold mb-6">What You'll Get</h3>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">190+ Clinical Resources</p>
                        <p className="text-sm text-gray-600">
                          Access to all protocols, forms, and training materials
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">HIPAA Compliant</p>
                        <p className="text-sm text-gray-600">
                          All documentation meets regulatory requirements
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Team Training</p>
                        <p className="text-sm text-gray-600">
                          Comprehensive training for pharmacists and technicians
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Billing Support</p>
                        <p className="text-sm text-gray-600">
                          CPT codes and billing guidance for all services
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Info */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-3">Have Questions?</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>info@clinicalrxq.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>1-800-CLINICAL</span>
                  </div>
                </div>
              </div>

              {/* Already a member */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 mb-2">Already have an account?</p>
                <Link to="/login">
                  <Button variant="outline" className="w-full bg-transparent">
                    Member Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default JoinPage