import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
function QuestionScale({ question, name, onChange }) {
  const [selectedValue, setSelectedValue] = useState(null);
  const handleChange = (event) => {
    setSelectedValue(event.target.value);
    onChange(event.target.value); 
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      <p style={{ color: "aliceblue", marginBottom: "0.5rem" }}>{question}</p>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {Array.from({ length: 7 }, (_, i) => i + 1).map((value) => (
          <React.Fragment key={value}>
            <input
              type="radio"
              id={`${name}-${value}`}
              name={name}
              value={value}
              checked={selectedValue === value.toString()}
              onChange={handleChange}
              style={{ display: "none" }}
            />
            <label
              htmlFor={`${name}-${value}`}
              style={{
                display: "block",
                padding: "0.5rem",
                cursor: "pointer",
                border: "none",
                borderRadius: "3px",
                textAlign: "center",
                backgroundColor: selectedValue === value.toString() ? "#007BFF" : "white",
                color: selectedValue === value.toString() ? "white" : "black",
              }}
            >
              {value}
            </label>
          </React.Fragment>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingTop: "0.2rem",
          color: "gray",
          fontSize: "1rem",
          paddingBottom: "0.5rem",
        }}
      >
        <div><i>Not at all</i></div>
        <div><i>Somewhat</i></div>
        <div><i>Very much</i></div>
      </div>
      <hr />
    </div>
  );
}

function Screen23() {
  const [responses, setResponses] = useState({});
  const navigate = useNavigate();
  const { pnumber, condition } = useParams();
  
  const handleScaleChange = (name, value) => {
    setResponses((prev) => ({ ...prev, [name]: value }));
  };

  // Conditional rendering flags
  const [showTipQuestions, setShowTipQuestions] = useState(false);

  // Fetch and verify user
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
    
    // Show tip-related questions for Pre-Tip and Post-Tip conditions
    if (condition === "Pre-Tip" || condition === "Post-Tip") {
      setShowTipQuestions(true);
    }
  }, [condition, navigate]);

  const clickedNext = () => {
    console.log("Responses:", responses);
    axios
      .post(`${REACT_APP_BACKEND_URL}/generate/saveresponsesforscreen23`, { pnumber,'token': localStorage.getItem('token'), condition, ...responses }, {
        withCredentials: true,
      })
      .then(() => {
        navigate(`/screen25/${pnumber}/${condition}`);
      })
      .catch((error) => {
        console.error("Error saving responses", error);
      });
  };

  return (
    <div
      style={{
        height: "100vh",
        backgroundColor: "black",
        color: "#6AD4DD",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
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
          <u>POST-STUDY QUESTIONS</u>
        </div>
        <div
          style={{
            fontSize: "1.2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            paddingTop: "2rem",
            color: "#6AD4DD",
            textAlign: "left",
          }}
        >
          <QuestionScale
            question="1. To what extent do you think your total compensation was affected by the effort level you chose?"
            name="Controllability1"
            onChange={(value) => handleScaleChange("Controllability1", value)}
          />
          <QuestionScale
            question="2. To what extent do you think you could influence your total compensation?"
            name="Controllability2"
            onChange={(value) => handleScaleChange("Controllability2", value)}
          />

          {/* Tip-related questions (for Pre-Service and Post-Service Tip conditions) */}
          {showTipQuestions && (
            <>
              <QuestionScale
                question="3. To what extent do you perceive that the tip you received from the Customer was affected by your effort level?"
                name="TipReason_Effort"
                onChange={(value) => handleScaleChange("TipReason_Effort", value)}
              />
              <QuestionScale
                question="4. To what do you perceive that the tip you received from the Customer was affected by the social pressure to tip?"
                name="TipReason_SocialImage"
                onChange={(value) => handleScaleChange("TipReason_SocialImage", value)}
              />
              <QuestionScale
                question="5. To what extent do you perceive that the tip you received from the Customer was affected by how other Customers normally tip Workers?"
                name="TipReason_SocialNorm"
                onChange={(value) => handleScaleChange("TipReason_SocialNorm", value)}
              />
            </>
          )}

          <div
            style={{
              fontSize: "1.2rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
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
                textAlign: "center",
              }}
              onClick={clickedNext}
            >
              Next
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Screen23;
