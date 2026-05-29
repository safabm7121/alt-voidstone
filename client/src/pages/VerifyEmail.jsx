import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const VerifyEmail = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/verify-email', { email, code });
      alert('Email verified!');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.error || 'Verification failed');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-6">Verify Email</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded" />
        <input required placeholder="Verification Code" value={code} onChange={e => setCode(e.target.value)} className="w-full p-2 border rounded" />
        <button type="submit" className="w-full bg-black text-white py-2 rounded">Verify</button>
      </form>
    </div>
  );
};

export default VerifyEmail;