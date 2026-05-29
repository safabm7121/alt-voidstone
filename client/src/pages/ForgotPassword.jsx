import { useState } from 'react';
import { api } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/forgot-password', { email });
      alert('If email exists, reset code sent.');
    } catch (err) {
      alert('Error');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-6">Forgot Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded" />
        <button type="submit" className="w-full bg-black text-white py-2 rounded">Send Reset Code</button>
      </form>
    </div>
  );
};

export default ForgotPassword;