import { useState } from 'react';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/contact/send', form);
      toast.success('Message sent!');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required placeholder="Your Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full p-2 border rounded" />
        <input required type="email" placeholder="Your Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full p-2 border rounded" />
        <textarea required rows="5" placeholder="Message" value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="w-full p-2 border rounded" />
        <button type="submit" className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800">Send Message</button>
      </form>
    </div>
  );
};

export default Contact;