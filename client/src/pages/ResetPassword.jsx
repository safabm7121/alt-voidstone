import { useState } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/reset-password', { email, code, newPassword });
      alert('Password reset!');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.error || 'Error');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-6">Reset Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded" />
        <input required placeholder="Reset Code" value={code} onChange={e => setCode(e.target.value)} className="w-full p-2 border rounded" />
        <input required type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-2 border rounded" />
        <button type="submit" className="w-full bg-black text-white py-2 rounded">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;