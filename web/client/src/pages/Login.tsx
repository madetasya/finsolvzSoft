import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import LogoDark from "../assets/FinsolvzLogoDark.png";
import backgroundImage from "../assets/backgroundWeb.jpg";
import loginCardImage from "../assets/LoginCard.png";

const API_URL = import.meta.env.VITE_API_URL

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url(${backgroundImage}) no-repeat center center;
  background-size: cover;
  overflow: hidden;
  user-select: none;
`;
const Card = styled.div`
  width: 400px;
  height: 500px;
  background: url(${loginCardImage}) no-repeat center center;
  background-size: contain;
  border-radius: 16px;
  box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
`;

const Logo = styled.img`
  width: 168px;
  margin-top: 42px;
  margin-right: 64px
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #333;
  margin-right: 56px;
  margin-top: 4px;
  font-weight: bold;
`;

const InputContainer = styled.div`
  width: 80%;
  margin-right: 96px;
  text-align: left;
  margin-bottom: -2px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-top: 16px;
  margin-bottom: 4px;
`;

const Input = styled.input.withConfig({
  shouldForwardProp: (prop) => prop !== 'inputcolor'
}) <{ inputcolor?: string }>`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  outline: none;
  font-size: 14px;
  background-color: ${(props) => props.inputcolor || "#f0f0f0"};
  text-align: left;
  color: #06272b;
  &:focus {
    border: 1px solid #4aa5a5;
  }
`;

const Button = styled.button`
  width: 86%;
  padding: 12px;
  background: #083339;
  color: white;
  margin-right: 72px;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  margin-top: 24px;
  cursor: pointer;

  &:hover {
    background: #06272b;
  }
`;

const ForgotPassword = styled.p`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  margin-right: 304px;
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    color: #333;
  }
`;

const Modal = styled.div`
  position: fixed;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

`;

const ModalContent = styled.div`
  margin-right: 72px;
  margin-top: 80px;
  background: white;
  padding: 24px;
  border-radius: 10px;
  text-align: left;
  width: 320px;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.8);
`;
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4px); /* Blur effect */
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalTitle = styled.h3`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #061616
`;

const ModalInput = styled(Input)`
  text-align: left;
  width: 90%
`;

const CloseButton = styled.button`
  width: 86%;
  border: none;
  background: #90151B;
  color: white;
  border-radius: 6px;
  margin-top: 8px;
  cursor: pointer;

  &:hover {
    background: #cc2b25;
  }
`;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  //ini buat kirim otp reset pass!!!!!! 
  const [resetMessage, setResetMessage] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      localStorage.setItem("token", response.data.access_token);
      alert("Login berhasil!");
      navigate("/report-input");
    } catch {
      throw new Error("Login failed");
    }
  };

  const handleForgotPassword = async () => {
    try {
      const response = await axios.post(`${API_URL}/forgot-password`, { email: resetEmail });
      setResetMessage(response.data.message);
    } catch {
      throw new Error("Email not found");
    }
  };

  return (
    <Container>
      <Card>
        <Logo src={LogoDark} alt="Finsolvz Logo" />
        <Subtitle>
          Please login to your account.
        </Subtitle>

        <InputContainer>
          <Label>E-mail</Label>
          <Input type="email" placeholder="Enter your email" inputcolor="#EAEAEA" value={email} onChange={(e) => setEmail(e.target.value)} />
        </InputContainer>

        <InputContainer>
          <Label>Password</Label>
          <Input type="password" placeholder="Enter your password" inputcolor="#EAEAEA" value={password} onChange={(e) => setPassword(e.target.value)} />
        </InputContainer>

        <Button onClick={handleLogin}>LOGIN</Button>
        <ForgotPassword onClick={() => setShowModal(true)}>Forgot password</ForgotPassword>
      </Card>

      {showModal && (
        <Modal>
          <ModalOverlay onClick={() => setShowModal(false)}>

            <ModalContent>
              <ModalTitle>Reset Password</ModalTitle>
              <ModalInput type="email" placeholder="Enter your email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
              <Button onClick={handleForgotPassword}>Send OTP</Button>
              {resetMessage && <p>{resetMessage}</p>}
              <CloseButton onClick={() => setShowModal(false)}>Close</CloseButton>
            </ModalContent>
          </ModalOverlay>

        </Modal>
      )}
    </Container>
  );
};

export default Login;
