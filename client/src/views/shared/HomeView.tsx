import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/shared/Icon';

const HomeView: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center gradient-purple shadow-md">
              <span className="text-white font-bold">+</span>
            </div>
            <span className="font-bold text-xl">HealthBridge</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-neutral-700 hover:text-primary-600 transition-colors">Services</a>
            <a href="#why-us" className="text-neutral-700 hover:text-primary-600 transition-colors">Why Us</a>
            <a href="#team" className="text-neutral-700 hover:text-primary-600 transition-colors">Team</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-neutral-700 hover:text-primary-600 font-semibold transition-colors">
              Sign in
            </Link>
            <Link to="/register" className="px-6 py-2 rounded-lg text-white font-semibold hover:shadow-lg transition-all gradient-purple">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-50 via-primary-50 to-neutral-100 py-20 md:py-32">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-primary-600 font-semibold text-sm mb-4">Your Health, Our Priority</p>
            <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6 text-pretty">
              Expert medical care you can rely on
            </h1>
            <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
              Experience healthcare you can trust. Our dedicated team provides compassionate, high-quality care designed to support your health at every stage of life.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/search" className="px-8 py-3 rounded-lg text-white font-bold hover:shadow-xl transition-all" style={{background:'#1976d2'}}>
                🔍 Find Clinics
              </Link>
              <Link to="/register" className="px-8 py-3 rounded-lg border-2 border-primary-600 text-primary-600 font-semibold hover:bg-primary-50 transition-colors">
                Book Appointment
              </Link>
            </div>

            {/* Social Proof */}
            <div className="mt-12 space-y-4">
              <div className="flex items-center gap-3">
                <Icon name="star" className="text-yellow-400" size={24} />
                <p className="text-neutral-700">
                  <span className="font-bold">5.0</span> rating based on 500+ reviews
                </p>
              </div>
              <p className="text-neutral-600">
                <Icon name="hospital" size={20} className="inline-block align-text-bottom mr-1" /> <span className="font-semibold">50+ Expert Doctors</span> • <Icon name="clock" size={20} className="inline-block align-text-bottom mx-1" /> <span className="font-semibold">24/7 Support</span>
              </p>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl group border-4 border-white">
            <img src="/images/tool1.jpg" alt="Medical Professional" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t from-black/90 to-transparent">
               <p className="font-bold text-3xl text-white mb-1 drop-shadow-lg tracking-tight">Medical Professional</p>
               <p className="text-lg font-medium text-purple-200 opacity-100 drop-shadow-md">Ready to help you</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-primary-600 font-semibold text-sm mb-2">Our Services</p>
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Comprehensive services for your health
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              From preventive care to specialized treatments, our wide range of services is designed to support your health at every stage.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { img: '/images/tool2.jpg', title: 'Urology', desc: 'Our urology department provides expert care for conditions affecting the urinary system and male reproductive health.' },
              { img: '/images/tool6.jpg', title: 'Neurology', desc: 'Our neurology department provides expert care for conditions affecting the brain, spine, and nervous system.' },
              { img: '/images/tool4.jpg', title: 'Eye Care', desc: 'Our eye care specialists provide comprehensive vision care and treatment for all eye conditions.' }
            ].map((service, idx) => (
              <div key={idx} className="bg-white border border-neutral-100 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group shadow-sm">
                <div className="h-56 overflow-hidden relative">
                  <img src={service.img} alt={service.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900/60 to-transparent opacity-40 group-hover:opacity-60 transition-opacity"></div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-primary-600 mb-3">{service.title}</h3>
                  <p className="text-neutral-600 mb-6 leading-relaxed line-clamp-3">{service.desc}</p>
                  <a href="#" className="inline-flex items-center gap-2 text-primary-600 font-bold hover:text-[#005c54] transition-colors">
                    Learn more <span className="transition-transform group-hover:translate-x-1">→</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="px-8 py-3 rounded-lg border-2 border-primary-600 text-primary-600 font-semibold hover:bg-primary-50 transition-colors">
              View All Services
            </button>
          </div>
        </div>
      </section>

      <section id="why-us" className="py-20 md:py-32 bg-gradient-to-br from-neutral-50 to-primary-50">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl group border-4 border-white">
            <img src="/images/tool3.jpg" alt="Healthcare Expert" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t from-black/90 to-transparent">
                <p className="font-bold text-3xl text-white mb-1 drop-shadow-lg">Healthcare Expert</p>
                <p className="text-lg font-medium text-purple-200 opacity-100 drop-shadow-md">Dedicated to your well-being</p>
            </div>
          </div>

          <div>
            <p className="text-primary-600 font-semibold text-sm mb-4">Why patients trust us</p>
            <h2 className="text-4xl font-bold text-neutral-900 mb-8">
              Professionals dedicated to your health
            </h2>
            
            <ul className="space-y-5">
              {[
                'We offer flexible hours to fit your busy schedule',
                'Team is committed to making you feel comfortable',
                'We ensure you receive prompt and effective care',
                'Helping you manage your health at every stage of life'
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-4">
                  <span className="text-primary-600 text-xl mt-1">✓</span>
                  <span className="text-neutral-700 text-lg">{item}</span>
                </li>
              ))}
            </ul>

            <button className="mt-10 px-8 py-3 rounded-lg text-white font-semibold hover:shadow-lg transition-all gradient-purple">
              View More About Us
            </button>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-primary-600 font-semibold text-sm mb-2">Team Members</p>
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Compassionate experts you can trust
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Our team brings together a wealth of experience, passion, and a dedication to excellence in patient care.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { name: 'Dr. Esther Howard', title: 'Ophthalmology', emoji: '👩‍⚕️' },
              { name: 'Dr. Jenny Wilson', title: 'Anesthesiology', emoji: '👨‍⚕️' },
              { name: 'Dr. Kristin Watson', title: 'Infectious Disease', emoji: '👩‍⚕️' },
              { name: 'Dr. Arlene Mccoy', title: 'Cardiology', emoji: '👨‍⚕️' }
            ].map((doctor, idx) => (
              <div key={idx} className="bg-gradient-to-br from-neutral-50 to-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="text-white">
                    <Icon name="user" size={64} />
                  </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-neutral-900 mb-1">{doctor.name}</h3>
                  <p className="text-primary-600 font-semibold text-sm mb-4">{doctor.title}</p>
                  <div className="flex gap-3">
                    <a href="#" className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-primary-100 flex items-center justify-center transition-colors">
                      <Icon name="phone" size={16} />
                    </a>
                    <a href="#" className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-primary-100 flex items-center justify-center transition-colors">
                      <Icon name="mail" size={16} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 text-white gradient-premium">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to take control of your health?
          </h2>
          <p className="text-xl mb-8 font-medium text-purple-100">
            Book your appointment today and experience expert medical care.
          </p>
          <Link to="/register" className="inline-block px-10 py-4 rounded-lg bg-white text-primary-600 font-bold hover:shadow-2xl transition-all">
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center gradient-purple">
                  <span className="text-white font-bold text-sm">+</span>
                </div>
                <span className="font-bold text-white">HealthBridge</span>
              </Link>
              <p className="text-sm">Expert healthcare at your fingertips.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Services</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Doctors</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Specialists</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Emergency</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <p className="text-sm flex items-center gap-2 mt-2">
                <Icon name="mail" size={16} /> info@healthbridge.com
              </p>
              <p className="text-sm flex items-center gap-2 mt-2">
                <Icon name="phone" size={16} /> +1 (234) 567-890
              </p>
            </div>
          </div>

          <div className="border-t border-neutral-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm">© 2024 HealthBridge. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="text-sm hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-sm hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="text-sm hover:text-white transition-colors">Accessibility</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeView;
