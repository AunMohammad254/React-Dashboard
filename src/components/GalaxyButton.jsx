import React from 'react';
import styled from 'styled-components';

const GalaxyButton = ({ children, onClick, disabled, type = "button", className, ...props }) => {
  return (
    <StyledWrapper className={className}>
      <button
        className="uiverse"
        onClick={onClick}
        disabled={disabled}
        type={type}
        {...props}
      >
        <div className="wrapper">
          <span className="content-span">{children || "UIVERSE"}</span>
          {/* Circles spread across the button */}
          <div className="circle circle-1" />
          <div className="circle circle-2" />
          <div className="circle circle-3" />
          <div className="circle circle-4" />
          <div className="circle circle-5" />
          <div className="circle circle-6" />
          <div className="circle circle-7" />
          <div className="circle circle-8" />
          <div className="circle circle-9" />
          <div className="circle circle-10" />
          <div className="circle circle-11" />
          <div className="circle circle-12" />
        </div>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  width: 100%;

  .uiverse {
    width: 100%;
    --duration: 7s;
    --easing: linear;
    --c-color-1: rgba(255, 163, 26, 0.7);
    --c-color-2: #1a23ff;
    --c-color-3: #e21bda;
    --c-color-4: rgba(255, 232, 26, 0.7);
    --c-shadow: rgba(255, 223, 87, 0.5);
    --c-shadow-inset-top: rgba(255, 223, 52, 0.9);
    --c-shadow-inset-bottom: rgba(255, 250, 215, 0.8);
    --c-radial-inner: #ffd215;
    --c-radial-outer: #fff172;
    --c-color: #fff;
    -webkit-tap-highlight-color: transparent;
    -webkit-appearance: none;
    outline: none;
    position: relative;
    cursor: pointer;
    border: none;
    display: block; /* Changed from table to block for full width */
    border-radius: 24px;
    padding: 0;
    margin: 0;
    text-align: center;
    font-weight: 600;
    font-size: 16px;
    letter-spacing: 0.02em;
    line-height: 1.5;
    color: var(--c-color);
    background: radial-gradient(
      ellipse at center,
      var(--c-radial-inner),
      var(--c-radial-outer) 80%
    );
    box-shadow: 0 0 14px var(--c-shadow);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .uiverse:hover {
    --duration: 1400ms;
    transform: scale(1.02);
    box-shadow: 0 0 24px var(--c-shadow), 0 4px 20px rgba(255, 210, 21, 0.3);
  }

  .uiverse:active {
    transform: scale(0.98);
  }

  /* Disabled state styling */
  .uiverse:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    filter: grayscale(0.5);
    --duration: 0s; /* Stop animations */
    transform: none;
  }

  .uiverse:before {
    content: "";
    pointer-events: none;
    position: absolute;
    z-index: 3;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    border-radius: 24px;
    box-shadow:
      inset 0 3px 12px var(--c-shadow-inset-top),
      inset 0 -3px 4px var(--c-shadow-inset-bottom);
  }

  .uiverse .wrapper {
    -webkit-mask-image: -webkit-radial-gradient(white, black);
    overflow: hidden;
    border-radius: 24px;
    width: 100%;
    padding: 16px 24px;
    position: relative;
  }

  .uiverse .wrapper .content-span {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    z-index: 10;
    width: 100%;
    padding: 0 16px;
  }

  /* Circles with percentage-based positioning for full coverage */
  .uiverse .wrapper .circle {
    position: absolute;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    filter: blur(var(--blur, 10px));
    background: var(--background, transparent);
    transform: translate(var(--x, 0), var(--y, 0)) translateZ(0);
    animation: var(--animation, none) var(--duration) var(--easing) infinite;
    z-index: 1;
    opacity: 0.9;
  }

  /* Color assignments */
  .uiverse .wrapper .circle.circle-1,
  .uiverse .wrapper .circle.circle-9,
  .uiverse .wrapper .circle.circle-10 {
    --background: var(--c-color-4);
  }

  .uiverse .wrapper .circle.circle-3,
  .uiverse .wrapper .circle.circle-4 {
    --background: var(--c-color-2);
    --blur: 16px;
  }

  .uiverse .wrapper .circle.circle-5,
  .uiverse .wrapper .circle.circle-6 {
    --background: var(--c-color-3);
    --blur: 18px;
  }

  .uiverse .wrapper .circle.circle-2,
  .uiverse .wrapper .circle.circle-7,
  .uiverse .wrapper .circle.circle-8,
  .uiverse .wrapper .circle.circle-11,
  .uiverse .wrapper .circle.circle-12 {
    --background: var(--c-color-1);
    --blur: 14px;
  }

  /* Distribute circles across the button using percentage-based positioning */
  .uiverse .wrapper .circle.circle-1 {
    left: 5%;
    top: 50%;
    --animation: circle-float-1;
  }

  .uiverse .wrapper .circle.circle-2 {
    left: 15%;
    top: 20%;
    --animation: circle-float-2;
  }

  .uiverse .wrapper .circle.circle-3 {
    left: 25%;
    top: 80%;
    --animation: circle-float-3;
  }

  .uiverse .wrapper .circle.circle-4 {
    left: 35%;
    top: 30%;
    --animation: circle-float-4;
  }

  .uiverse .wrapper .circle.circle-5 {
    left: 45%;
    top: 70%;
    --animation: circle-float-5;
  }

  .uiverse .wrapper .circle.circle-6 {
    left: 55%;
    top: 25%;
    --animation: circle-float-6;
  }

  .uiverse .wrapper .circle.circle-7 {
    left: 65%;
    top: 75%;
    --animation: circle-float-7;
  }

  .uiverse .wrapper .circle.circle-8 {
    left: 75%;
    top: 35%;
    --animation: circle-float-8;
  }

  .uiverse .wrapper .circle.circle-9 {
    left: 85%;
    top: 60%;
    --animation: circle-float-9;
  }

  .uiverse .wrapper .circle.circle-10 {
    left: 90%;
    top: 20%;
    --animation: circle-float-10;
  }

  .uiverse .wrapper .circle.circle-11 {
    left: 10%;
    top: 60%;
    --animation: circle-float-11;
  }

  .uiverse .wrapper .circle.circle-12 {
    left: 50%;
    top: 10%;
    --animation: circle-float-12;
  }

  /* Updated keyframes with smoother movement */
  @keyframes circle-float-1 {
    0%, 100% { transform: translate(0, -50%) scale(1); }
    33% { transform: translate(10px, -40%) scale(1.1); }
    66% { transform: translate(-5px, -60%) scale(0.9); }
  }

  @keyframes circle-float-2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(15px, 10px) scale(1.15); }
    66% { transform: translate(-10px, -5px) scale(0.85); }
  }

  @keyframes circle-float-3 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(-8px, -15px) scale(1.1); }
    66% { transform: translate(12px, 5px) scale(0.9); }
  }

  @keyframes circle-float-4 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(20px, 8px) scale(1.2); }
    66% { transform: translate(-5px, -12px) scale(0.8); }
  }

  @keyframes circle-float-5 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(-12px, -8px) scale(1.1); }
    66% { transform: translate(8px, 12px) scale(0.95); }
  }

  @keyframes circle-float-6 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(10px, 15px) scale(1.15); }
    66% { transform: translate(-15px, -5px) scale(0.85); }
  }

  @keyframes circle-float-7 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(-5px, -10px) scale(1.1); }
    66% { transform: translate(10px, 5px) scale(0.9); }
  }

  @keyframes circle-float-8 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(15px, -5px) scale(1.2); }
    66% { transform: translate(-10px, 10px) scale(0.85); }
  }

  @keyframes circle-float-9 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(-8px, 8px) scale(1.1); }
    66% { transform: translate(5px, -15px) scale(0.9); }
  }

  @keyframes circle-float-10 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(12px, 10px) scale(1.15); }
    66% { transform: translate(-5px, -8px) scale(0.9); }
  }

  @keyframes circle-float-11 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(-10px, -12px) scale(1.1); }
    66% { transform: translate(15px, 5px) scale(0.85); }
  }

  @keyframes circle-float-12 {
    0%, 100% { transform: translate(-50%, 0) scale(1); }
    33% { transform: translate(-45%, 15px) scale(1.2); }
    66% { transform: translate(-55%, -10px) scale(0.9); }
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .uiverse {
      font-size: 14px;
      border-radius: 18px;
    }

    .uiverse .wrapper {
      padding: 14px 20px;
      border-radius: 18px;
    }

    .uiverse .wrapper .circle {
      width: 45px;
      height: 45px;
    }

    .uiverse:before {
      border-radius: 18px;
    }
  }

  @media (max-width: 480px) {
    .uiverse {
      font-size: 13px;
      border-radius: 14px;
    }

    .uiverse .wrapper {
      padding: 12px 16px;
      border-radius: 14px;
    }

    .uiverse .wrapper .circle {
      width: 35px;
      height: 35px;
    }

    .uiverse:before {
      border-radius: 14px;
    }
  }
`;

export default GalaxyButton;
