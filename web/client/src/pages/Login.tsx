import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";
import "../styles/font.css"
import VideoBG from "/Video.mp4"
import FlowlyCard from "../assets/FlowlyCardLogin.png";
import LogoBright from "../assets/LogoHorizontal.png";
import ModalOTP from "../assets/ModalSendOTP.png";

const API_URL = import.meta.env.VITE_API_URL
const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        setErrorMessage("Please fill up all fields");
        return;
      }
      const response = await axios.post(`${API_URL}/login`, { email, password });

      localStorage.setItem("token", response.data.access_token);
      setErrorMessage("Error Login");
      navigate("/report-input");

    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response &&
        error.response.status === 400 &&
        error.response.data.error === "Invalid email or password"
      ) {
        setErrorMessage("Wrong password or email!");
      } else {
        setErrorMessage("Something went wrong, try again.");
      }
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

      <Video
        src={VideoBG}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onContextMenu={(e) => e.preventDefault()}
      />
      <FillerBox />
      <FlowlyCardLogin src={FlowlyCard} onContextMenu={(e) => e.preventDefault()} />
      <LoginCard>
        <Logo src={LogoBright} />
        <WelcomeText>WELCOME</WelcomeText>
        <SubText>Enter your account</SubText>
        {errorMessage && <ErrorText>{errorMessage}</ErrorText>}
        <Input
          type="text"
          placeholder="E-MAIL"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          peer-not-placeholder-shown:font-normal
        />
        <Input
          type="password"
          placeholder="PASSWORD"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <ForgotPasswordText onClick={() => setShowModal(true)}>
          Forgot password?
        </ForgotPasswordText>

        <LoginButton onClick={handleLogin}>SIGN IN</LoginButton>

      </LoginCard>
      {showModal && (
        <ModalOverlay>
          <ModalCard>
            <h3 style={{ fontWeight: 700 }}>Reset your password</h3>
            <ModalInput
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />
            <SendOTPButton onClick={handleForgotPassword}>

              SEND OTP
            </SendOTPButton>
            {resetMessage && <p>{resetMessage}</p>}
            <CloseModal onClick={() => setShowModal(false)}>✕</CloseModal>
          </ModalCard>
        </ModalOverlay>
      )}

    </Container>
  );
};



const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background: #000609;
  overflow: hidden;
`;


const Video = styled.video`
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.7;
  pointer-events: none;
  z-index: 1;
`;

const FillerBox = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 1000px;
  height: 100px;
  background-color: #000609;
  z-index: 0;
`;

const FlowlyCardLogin = styled.img`
  position: fixedd;
  height: 100%;
  width: 100%;
  object-fit: cover;
  top: 0;
  z-index: 10;
`;
const LoginCard = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 100vh;
  width: 50vw;
  z-index: 20;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 160px;
  color: white;
`;

const Logo = styled.img`
  width: 240px;
  margin-bottom: 24px;
  margin-left: -16px
`;

const WelcomeText = styled.h2`
  font-size: 32px;
  letter-spacing: 4px;
  text-shadow: 0px 4px 4px rgba(0, 0, 0, 1);
  cursor: default;
  font-weight: 700;
  margin-bottom: 16px;
`;

const SubText = styled.p`
  font-size: 24px;
  color: rgb(152, 184, 167);
  margin-top: -24px;
  margin-bottom: 48px;
    text-shadow: 0px 4px 4px rgba(0, 0, 0, 1);
      cursor: default;
  font-weight: 300;
`;

const Input = styled.input`
  background: transparent;
  margin-bottom: 24px;
  border: none;
  border-bottom: 3px solid rgb(152, 184, 167);
  padding: 12px 0;
  color: white;
  font-size: 14px;
  width: 300px;
  outline: none;
  font-style: italic;
  letter-spacing: 2px;
  
   &:not(:placeholder-shown) {
    font-style: normal;
    font-weight: 300;
    font-size: 24px;
  }

  &::placeholder {
    color:rgb(152, 184, 167);
    transition: opacity 0.2s ease;
  }

  &:focus::placeholder {
    opacity: 0;
  }

  &:focus {
    border: none;
    border-bottom: 3px solid #ffff;
    background: transparent;
    font-style: normal;
    box-shadow: none;
  }

 
  &:after {
    content: " ";
    font-style: normal;
  }
  &:-webkit-autofill {
    box-shadow: 0 0 0px 1000px #000609 inset;
    -webkit-text-fill-color: white;
    transition: background-color 5000s ease-in-out 0s;
      font-style: normal;
`;
const ForgotPasswordText = styled.p`
  color: rgb(152, 184, 167);
  font-size: 16px;
  margin-top: -8px;
  margin-bottom: 16px;
  cursor: pointer;
  text-decoration: underline;
  width: fit-content;

  &:hover {
    color: #fff;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background: rgba(0, 0, 0, 0.6);
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalCard = styled.div`
  background-image: url(${ModalOTP});
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  width: 500px;
  height: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const ModalInput = styled.input`
  background: transparent;
  border: none;
  border-bottom: 2px solid #aaa;
  padding: 12px 0;
  color: white;
  font-size: 14px;
  outline: none;

  &::placeholder {
    color: #aaa;
  }

  &:focus {
    border-bottom: 2px solid #3fa073;
  }
`;

const SendOTPButton = styled.button`
  margin-top: 24px;
  width: 200px;
  background-color: #3fa073;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0px 8px 4px rgba(0, 0, 0, 0.3);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
  font-weight: 700
`;

const CloseModal = styled.span`
  position: absolute;
  top: 176px;
  right: 24px;
  font-size: 20px;
  cursor: pointer;
`;


const LoginButton = styled.button`
  margin-top: 32px;
  font-size: 24px;
  font-weight: 700;
  background-color:rgb(40, 136, 115);
  color: white;
  border: none;
  padding: 12px 112px;
  border-radius: 999px;
  width: fit-content;
  cursor: pointer;
  box-shadow: 0px 12px 24px rgba(0, 0, 0, 0.6);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0px 6px 32px rgba(0, 0, 0, 4);
    transform: translateY(-2px);
  }

  &:active {
    box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.3);
    transform: translateY(1px);
  }
`;

const ErrorText = styled.p`
  color: #ff6b6b;
  font-size: 14px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
  position: absolute;
  margin-bottom: 32px;
`;
export default Login;
