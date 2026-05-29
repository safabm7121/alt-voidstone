import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate('/verify-email');
    } catch (err) {
      alert(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-6">Register</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required placeholder="First Name" className="w-full p-2 border rounded" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
        <input required placeholder="Last Name" className="w-full p-2 border rounded" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
        <input required type="email" placeholder="Email" className="w-full p-2 border rounded" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        <input required type="password" placeholder="Password" className="w-full p-2 border rounded" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
        <button type="submit" className="w-full bg-black text-white py-2 rounded">Register</button>
      </form>
      <div className="mt-4 text-center">
        <Link to="/login" className="text-sm hover:underline">Already have an account?</Link>
      </div>
    </div>
  );
};

export default Register;