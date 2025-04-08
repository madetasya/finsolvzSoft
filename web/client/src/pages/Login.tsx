import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
// import backgroundImage from "../assets/backgroundLogin.png";
import ButtonLoginAct from "../assets/ButtonLoginAct.png";
import ButtonLoginInact from "../assets/ButtonLogin.png";
import FinsolvzLogoBright from "../assets/LogoHorizontal.png";
// import loginCardImage from "../assets/LoginCard.png";
import "../styles/font.css"

const API_URL = import.meta.env.VITE_API_URL

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
background: linear-gradient(0deg, #041012 0%, #041012 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0.20) 100%), linear-gradient(303deg, rgba(7, 23, 23, 0.00) 2.29%, rgba(38, 125, 125, 0.16) 66.11%), #041417;
  background-size: cover;
`;

const Card = styled.div`
  width: 400px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 40px;
`;

const Logo = styled.img`
  width: 200px;
  margin-bottom: 24px;
`;

const InputContainer = styled.div`
  width: 168%;
  flex-direction: column;
`;

const Input = styled.input`
  width: 100%;
  font-size: 24px;
  font-weight: 300;
  border: none;
  text-align: left;
  outline: none;
  font-style: italic;
  background: linear-gradient(45deg, #ffcc00, #ff6600, #cc00ff);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;

  &::placeholder {
    color:rgba(199, 149, 63,0.5);
    font-weight: 300;
    font-style: italic;
  }

  &:focus {
    border-bottom: 0px solid rgb(243, 231, 181);
  }
`;
const ButtonLogin = styled.button`
  all: unset;
  margin-top: 50px;
  background: url(${ButtonLoginInact}) no-repeat center center;
  background-size: contain;
  width: 100%;
  height: 40px;
  display: block;
  transition: background 0.3s ease-in-out;

  &:hover {
    background: url(${ButtonLoginAct}) no-repeat center center;
    background-size: contain;
  }
`;

const ErrorMessage = styled.p`
  color: rgba(152, 11, 11, 0.8);
  font-size: 16px;
  margin-left: 0px;
`;
const Button = styled.button`
  width: 112%;
  padding: 12px;
  background:rgba(65, 79, 82, 0.27);
  backdrop-filter: blur(4px);
  color: rgba(215, 195, 131, 0.9);
  font-weight: bold;
  font-size: 16px;
  border: 1px solid rgba(218, 218, 218, 0.21);
  border-radius: 90px;
  margin-top: 56px;
  cursor: pointer;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 1)

  &:hover {
    background: rgba(255, 255, 255, 0.27);
    color: rgb(255, 255, 255);
    border: 1px solid rgba(218, 218, 218, 0.21);
  }
`;

const ForgotPassword = styled.p`
  font-size: 12px;
  color: #D3C2A2;
  margin-top: 4px;
  margin-right: 72px;
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
  backdrop-filter: blur(4px);
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
  margin-left: 40px;

  &:hover {
    background: #cc2b25;
  }
`;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const handleLogin = async () => {
    console.log("Email:", email);
    console.log("Password:", password);
    try {
      if (!email || !password) {
        setErrorMessage("Please fill up all fields");
        return;
      }
      const response = await axios.post(`${API_URL}/login`, { email, password });
      localStorage.setItem("token", response.data.access_token);
      setErrorMessage("");
      navigate("/report-input");
    } catch {
      setErrorMessage("Invalid email or password");
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
        <Logo src={FinsolvzLogoBright} alt="Finsolvz Logo" />

        <InputContainer>
          <Input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
          <ButtonLogin onClick={handleLogin} />
        </InputContainer>

        <ForgotPassword onClick={() => setShowModal(true)}>Forgot password</ForgotPassword>
      </Card>

      {showModal && (
        <Modal>
          <ModalOverlay >
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
