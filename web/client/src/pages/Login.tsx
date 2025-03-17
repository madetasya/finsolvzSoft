import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import styled from "styled-components";
import axios from "axios";
import LogoDark from "../assets/FinsolvzLogoDark.png";

const API_URL = import.meta.env.VITE_API_URL 

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(180deg, #041417 42.5%, #083339);
`;

const Card = styled.div`
  width: 400px;
  padding: 32px;
  background: rgba(248, 248, 248, 0.92);
  border-radius: 16px;
  box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.2);
  text-align: center;
`;

const Logo = styled.img`
  width: 140px;
  margin-bottom: 12px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #333;
  margin-bottom: 24px;

  b {
    font-weight: bold;
  }

  span {
    color: #4aa5a5;
    font-weight: bold;
  }
`;

const InputContainer = styled.div`
  width: 100%;
  text-align: left;
  margin-bottom: 16px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: bold;
  color: #333;
  display: block;
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
  width: 100%;
  padding: 12px;
  background: #083339;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  margin-top: 16px;
  cursor: pointer;

  &:hover {
    background: #06272b;
  }
`;

const ForgotPassword = styled.p`
  font-size: 12px;
  color: #666;
  margin-top: 12px;
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    color: #333;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background: white;
  padding: 24px;
  border-radius: 10px;
  text-align: left;
  width: 320px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
`;

const ModalInput = styled(Input)`
  text-align: center;
`;

const CloseButton = styled.button`
  width: 100%;
  padding: 8px;
  border: none;
  background: #ff3b30;
  color: white;
  border-radius: 6px;
  margin-top: 10px;
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
          Satu langkah{" "}
          <b>
            untuk <span>data</span> yang tertata
          </b>
        </Subtitle>

        <InputContainer>
          <Label>E-mail</Label>
          <Input type="email" placeholder="Masukkan email" inputcolor="#EAEAEA" value={email} onChange={(e) => setEmail(e.target.value)} />
        </InputContainer>

        <InputContainer>
          <Label>Password</Label>
          <Input type="password" placeholder="Masukkan password" inputcolor="#EAEAEA" value={password} onChange={(e) => setPassword(e.target.value)} />
        </InputContainer>

        <Button onClick={handleLogin}>LOGIN</Button>
        <ForgotPassword onClick={() => setShowModal(true)}>forgot password</ForgotPassword>
      </Card>

      {showModal && (
        <Modal>
          <ModalContent>
            <ModalTitle>Reset Password</ModalTitle>
            <ModalInput type="email" placeholder="Masukkan email Anda" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
            <Button onClick={handleForgotPassword}>Send OTP</Button>
            {resetMessage && <p>{resetMessage}</p>}
            <CloseButton onClick={() => setShowModal(false)}>Close</CloseButton>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Login;
