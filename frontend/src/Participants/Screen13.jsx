import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const socket = io(`${REACT_APP_BACKEND_URL}`, {
  transports: ["websocket", "polling"], // Use default transports
});

function Screen13() {
  let { pnumber, condition,currentround } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [tip, setTip] = useState("");

  if (currentround == 0) {
    currentround = "Practice Round";
  }

  const apicall = async () => {
    try{
      const x = await axios.post(`${REACT_APP_BACKEND_URL}/generate/addworkertip`,{pnumber, currentround, tip, 'token': localStorage.getItem('token')},{
        withCredentials:true
      })
      console.log(26,x.data)
    }catch(e){
      console.log('error ',e)
    }
  }
  // const clickedNext = async() => {
  //   await apicall()
  //   navigate(`/waiting/${pnumber}/${condition}/${currentround}`);
  //   // socket.emit("nextto14");
  //   socket.emit("nextto14", { currentPnumber: pnumber });
  // };

  const clickedNext = async() => {
    await apicall()
    navigate(`/waiting/${pnumber}/${condition}/${currentround}`);
    // socket.emit("nextto14");

    await axios
            .post(
              `${REACT_APP_BACKEND_URL}/generate/matchpnumberforcustomer`,
              { pnumber, currentround, 'token': localStorage.getItem('token')},
              { withCredentials: true }
            )
            .then((res) => {
              console.log(120, res);
              
              socket.emit("nextto14", {
                currentPnumber: pnumber,
                participant: res.data.participant,
              });
            });
  };

  const handleInp = (e) => {
    const newValue = e.target.value;

    // Validate the input
    if (newValue === "" || (isWholeNumber(newValue) && isInRange(newValue))) {
      setTip(newValue);
      setError(""); // Clear any existing error
    } else {
      setError("Please enter a whole number between 0 and 80.");
    }
  };
  const isWholeNumber = (value) => {
    return /^\d+$/.test(value); // Matches only whole numbers
  };

  const isInRange = (value) => {
    const numberValue = parseInt(value, 10);
    return numberValue >= 0 && numberValue <= 80;
  };

  const verifyUser = () => {
    axios
      .post(`${REACT_APP_BACKEND_URL}/generate/getlink`,{'token': localStorage.getItem('token')}, {
        withCredentials: true,
      })
      .then((res) => {
        console.log(21, res.data);
        if (res.data.msg === "access denied") {
          navigate("/notfound");
        }
      })
      .catch((e) => {
        navigate("/notfound");
      });
  };
  
  useEffect(() => {
    verifyUser();
  }, []);
  return (
    <>
      <div
        style={{
          height: "100vh",
          backgroundColor: "black",
          color: "#6AD4DD",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "40rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.4rem",
            fontSize: "1.4rem",
          }}
        >
          <div
            style={{
              color: "aliceblue",
              fontSize: "2rem",
              textAlign: "center",
            }}
          >
            <u>TIPPING DECISION | {currentround}</u>
          </div>
          <div
            style={{
              fontSize: "1.2rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <div>
              As Customer, you now need to{" "}
              <i>decide how much to tip the Worker.</i>{" "}
            </div>
            <div>
              You need to decide how much to tip the Worker for their service{" "}
              <i>before</i> they serve you. The amount of tip can range from
              zero up to 80 tokens (rounded to the nearest whole number). The
              Worker will be informed of the tip you pay <i>before</i> they make
              their choice of effort level.
            </div>
            <div>Please make your choice: </div>
            <div style={{ color: "aliceblue" }}>
              How much do you want to tip the Worker for their service?
            </div>
            <div>
              <input
                style={{
                  width: "7rem",
                  border: "none",
                  outline: "none",
                  backgroundColor: "transparent",
                  padding: "0.5rem",
                  fontSize: "1rem",
                  color: "aliceblue",
                  borderBottom: "1px solid #6AD4DD",
                }}
                type="text"
                placeholder="Enter Tip"
                name="tip"
                value={tip}
                onChange={handleInp}
              />
              {error && (
                <div style={{ color: "red", marginTop: "0.5rem" }}>{error}</div>
              )}
            </div>
          </div>

          <div style={{ fontSize: "1.2rem" }}>
            Please click ‘Next’ to continue.
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                backgroundColor: "aliceblue",
                color: "black",
                width: "2.9rem",
                padding: "1rem",
                borderRadius: "0.2rem",
                cursor: "pointer",
              }}
              onClick={clickedNext}
            >
              Next
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Screen13;
