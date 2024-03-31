import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { UserService } from '../../api/generated/services/UserService'
import logoImage from '../../images/pokerlogo.jpeg';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();

    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Logged in user:', result.user);

      const userInfo = await UserService.getUserMe();
      if (userInfo.teamId) {
        navigate('/dashboard');
      } else {
        navigate('/create-team');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <img src={logoImage} alt="Logo" style={{ width: '60%' }} />
      </div>
      <h1 style={{ textAlign: 'center', marginTop: '50px' }}>Poker AI Login</h1>
      <h3 style={{ textAlign: 'center', marginTop: '20px' }}>Only CMU emails are accepted.</h3>
      <button style={{ display: 'block', margin: '20px auto', border: '1px solid black' }} onClick={handleLogin}>Sign in with Google</button>
    </>
  );
};

export default Login;
