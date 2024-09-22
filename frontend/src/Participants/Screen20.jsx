import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
function Screen20() {
  const navigate = useNavigate();
  let { pnumber, condition, currentround } = useParams();
  pnumber = Number(pnumber);
  const [showFC, setShowFc] = useState(false);
  const [showSC, setShowSC] = useState(false);
  const [showPre, setShowPre] = useState(false);
  const [showPost, setShowPost] = useState(false);
  const [fetchedData, setFetchedData] = useState();
  const [lastRoundCumulativeComp, setLastRoundCumulativeComp] = useState(0);

  const renderTable = () => {
    if (!fetchedData) {
      return (
        <tr>
          <td colSpan="4" style={tdStyle}>
            Loading...
          </td>
        </tr>
      );
    }

    console.log("Fetched Data:", fetchedData); // Debug: Check the fetchedData structure

    let cumulativeComp = 0; // Initialize cumulative compensation
    // Filter out 'practice_round' and limit rows based on currentround
    return Object.keys(fetchedData)
      .filter(
        (roundKey) =>
          roundKey !== "practice_round" &&
          parseInt(roundKey) <= parseInt(currentround)
      )
      .map((roundKey, index) => {
        // Find the matching customer based on `pnumber`
        console.log(40, pnumber);
        const roundData = fetchedData[roundKey].find(
          (data) => data.customer === pnumber
        );

        console.log(`Round: ${roundKey}, Data:`, roundData); // Debug: Check each round's data

        // If no matching customer is found, skip this round
        if (!roundData) return null;

        // Calculate TotalComp for this round
        const totalComp = 60 + (roundData.effort * 200);

        // Add this round's TotalComp to the cumulativeComp
        cumulativeComp += totalComp;

        return (
          <tr key={index}>
            <td style={tdStyle}>{roundKey}</td>
            <td style={tdStyle}>60 tokens</td>
            <td style={tdStyle}>{roundData.effort * 200} tokens</td>
            <td style={tdStyle}>{60 + (roundData.effort * 200)} tokens</td>
          </tr>
        );
      });
  };

  const renderTableSC = () => {
    if (!fetchedData) {
      return (
        <tr>
          <td colSpan="4" style={tdStyle}>
            Loading...
          </td>
        </tr>
      );
    }

    console.log("Fetched Data:", fetchedData); // Debug: Check the fetchedData structure

    let cumulativeComp = 0; // Initialize cumulative compensation
    // Filter out 'practice_round' and limit rows based on currentround
    return Object.keys(fetchedData)
      .filter(
        (roundKey) =>
          roundKey !== "practice_round" &&
          parseInt(roundKey) <= parseInt(currentround)
      )
      .map((roundKey, index) => {
        // Find the matching customer based on `pnumber`
        const roundData = fetchedData[roundKey].find(
          (data) => data.customer === pnumber
        );

        console.log(`Round: ${roundKey}, Data:`, roundData); // Debug: Check each round's data

        // If no matching customer is found, skip this round
        if (!roundData) return null;

        // Calculate TotalComp for this round
        const totalComp = 60 + (roundData.effort * 200) - 40;

        // Add this round's TotalComp to the cumulativeComp
        cumulativeComp += totalComp;

        return (
          <tr key={index}>
            <td style={tdStyle}>{roundKey}</td>
            <td style={tdStyle}>60 tokens</td>
            <td style={tdStyle}>{roundData.effort * 200} tokens</td>
            <td style={tdStyle}>40 tokens</td>
            <td style={tdStyle}>{60 + (roundData.effort * 200) - 40} tokens</td>
          </tr>
        );
      });
  };

  const renderTablePre = () => {
    if (!fetchedData) {
      return (
        <tr>
          <td colSpan="4" style={tdStyle}>
            Loading...
          </td>
        </tr>
      );
    }

    console.log("Fetched Data:", fetchedData); // Debug: Check the fetchedData structure

    let cumulativeComp = 0; // Initialize cumulative compensation
    
    const effortToTokens = {
      0.1: 0,
      0.2: 5,
      0.3: 10,
      0.4: 20,
      0.5: 30,
      0.6: 40,
      0.7: 50,
      0.8: 60,
      0.9: 75,
      1.0: 90
    };
  
    // Filter out 'practice_round' and limit rows based on currentround
    return Object.keys(fetchedData)
      .filter(
        (roundKey) =>
          roundKey !== "practice_round" &&
          parseInt(roundKey) <= parseInt(currentround)
      )
      .map((roundKey, index) => {
        // Find the matching customer based on `pnumber`
        const roundData = fetchedData[roundKey].find(
          (data) => data.customer === pnumber
        );
        const effortTokens = Number(effortToTokens[roundData.effort]) || 0; 
        const totalComp = 60 + effortTokens -roundData.pretip ;
        cumulativeComp += totalComp;

        return (
          <tr key={index}>
            <td style={tdStyle}>{roundKey}</td>
            <td style={tdStyle}>60 tokens</td>
            <td style={tdStyle}>{roundData.effort * 200} tokens</td>
            <td style={tdStyle}>{roundData.pretip}</td>
            <td style={tdStyle}>{totalComp} tokens</td>
          </tr>
        );
      });
  };

  const renderTablePost = () => {
    if (!fetchedData) {
      return (
        <tr>
          <td colSpan="4" style={tdStyle}>
            Loading...
          </td>
        </tr>
      );
    }

    console.log("Fetched Data:", fetchedData); // Debug: Check the fetchedData structure

    let cumulativeComp = 0; // Initialize cumulative compensation
    
    const effortToTokens = {
      0.1: 0,
      0.2: 5,
      0.3: 10,
      0.4: 20,
      0.5: 30,
      0.6: 40,
      0.7: 50,
      0.8: 60,
      0.9: 75,
      1.0: 90
    };
  
    // Filter out 'practice_round' and limit rows based on currentround
    return Object.keys(fetchedData)
      .filter(
        (roundKey) =>
          roundKey !== "practice_round" &&
          parseInt(roundKey) <= parseInt(currentround)
      )
      .map((roundKey, index) => {
        // Find the matching customer based on `pnumber`
        const roundData = fetchedData[roundKey].find(
          (data) => data.customer === pnumber
        );
        const effortTokens = Number(effortToTokens[roundData.effort]) || 0; 
        const totalComp = 60  + effortTokens - roundData.pretip; 
        cumulativeComp += totalComp;

        return (
          <tr key={index}>
            <td style={tdStyle}>{roundKey}</td>
            <td style={tdStyle}>60 tokens</td>
            <td style={tdStyle}>{roundData.effort * 200} tokens</td>
            <td style={tdStyle}>{roundData.pretip}</td>
            <td style={tdStyle}>{totalComp} tokens</td>
          </tr>
        );
      });
  };

  const fetchSummary = async (condition) => {
    try {
      const res = await axios.post(
        `${REACT_APP_BACKEND_URL}/generate/fetchsummary`,
        {'token':localStorage.getItem('token')},
        {
          withCredentials: true,
        }
      );
      setFetchedData(res.data.matches.matches);
      console.log(113, res.data.matches.matches);

      if (condition == 'Fixed Condition') {
        if (!res.data.matches.matches) return;

        let cumulativeComp = 0;

        // Filter the rounds
        const filteredRounds = Object.keys(res.data.matches.matches).filter(
          (roundKey) =>
            roundKey !== "practice_round" &&
            parseInt(roundKey) <= parseInt(currentround)
        );

        filteredRounds.forEach((roundKey, index) => {
          const roundData = res.data.matches.matches[roundKey].find(
            (data) => data.customer === Number(pnumber)
          );
          const effortComp = roundData.effort * 200;
          const totalComp = 60 + effortComp;

          cumulativeComp += totalComp;
          // Only set lastRoundCumulativeComp when the last round is processed
          if (index + 1 === Number(currentround)) {
            setLastRoundCumulativeComp(cumulativeComp);
          }
        });
      }
      if (condition == 'Service Charge') {
        if (!res.data.matches.matches) return;

        const effortToTokens = {
          0.1: 0,
          0.2: 5,
          0.3: 10,
          0.4: 20,
          0.5: 30,
          0.6: 40,
          0.7: 50,
          0.8: 60,
          0.9: 75,
          1.0: 90,
        };

        let cumulativeComp = 0;

        // Filter the rounds
        const filteredRounds = Object.keys(res.data.matches.matches).filter(
          (roundKey) =>
            roundKey !== "practice_round" &&
            parseInt(roundKey) <= parseInt(currentround)
        );

        filteredRounds.forEach((roundKey, index) => {
          const roundData = res.data.matches.matches[roundKey].find(
            (data) => data.customer === Number(pnumber)
          );
          const effortTokens = Number(effortToTokens[roundData.effort]) || 0;
          const totalComp = 60 + (roundData.effort * 200) - 40;
          cumulativeComp += totalComp;

          // Only set lastRoundCumulativeComp when the last round is processed
          if (index + 1 === Number(currentround)) {
            setLastRoundCumulativeComp(cumulativeComp);
          }
        });
      }
      if (condition == 'Pre-Tip') {
        if (!res.data.matches.matches) return;

        const effortToTokens = {
          0.1: 0,
          0.2: 5,
          0.3: 10,
          0.4: 20,
          0.5: 30,
          0.6: 40,
          0.7: 50,
          0.8: 60,
          0.9: 75,
          1.0: 90,
        };

        let cumulativeComp = 0;

        // Filter the rounds
        const filteredRounds = Object.keys(res.data.matches.matches).filter(
          (roundKey) =>
            roundKey !== "practice_round" &&
            parseInt(roundKey) <= parseInt(currentround)
        );

        filteredRounds.forEach((roundKey, index) => {
          const roundData = res.data.matches.matches[roundKey].find(
            (data) => data.customer === pnumber
          );
          const effortTokens = Number(effortToTokens[roundData.effort]) || 0;
          const totalComp = 60 + effortTokens- roundData.pretip;

          cumulativeComp += totalComp;

          // Only set lastRoundCumulativeComp when the last round is processed
          if (index + 1 === Number(currentround)) {
            setLastRoundCumulativeComp(cumulativeComp);
          }
        });
      }
      if (condition == 'Post-Tip') {
        if (!res.data.matches.matches) return;

        const effortToTokens = {
          0.1: 0,
          0.2: 5,
          0.3: 10,
          0.4: 20,
          0.5: 30,
          0.6: 40,
          0.7: 50,
          0.8: 60,
          0.9: 75,
          1.0: 90,
        };

        let cumulativeComp = 0;

        // Filter the rounds
        const filteredRounds = Object.keys(res.data.matches.matches).filter(
          (roundKey) =>
            roundKey !== "practice_round" &&
            parseInt(roundKey) <= parseInt(currentround)
        );

        filteredRounds.forEach((roundKey, index) => {
          const roundData = res.data.matches.matches[roundKey].find(
            (data) => data.customer === pnumber
          );
          console.log(432, roundData)
          const effortTokens = Number(effortToTokens[roundData.effort]) || 0;
          const totalComp = 60 + effortTokens - roundData.pretip;
          cumulativeComp += totalComp;

          // Only set lastRoundCumulativeComp when the last round is processed
          if (index + 1 === Number(currentround)) {
            setLastRoundCumulativeComp(cumulativeComp);
          }
        });
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  useEffect(() => {
    if (condition === "Fixed Condition") {
      setShowFc(true);
    }
    if (condition === "Service Charge") {
      setShowSC(true);
    }
    if (condition === "Pre-Tip") {
      setShowPre(true);
    }
    if (condition === "Post-Tip") {
      setShowPost(true);
    }
    fetchSummary(condition);
  }, [condition]);

  const containerStyle = {
    height: "100vh",
    backgroundColor: "black",
    color: "#6AD4DD",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "2rem",
    flexDirection: "column",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "1rem",
  };

  const thStyle = {
    border: "1px solid #6AD4DD",
    padding: "0.5rem 1rem",
    textAlign: "center",
    backgroundColor: "#333333",
  };

  const tdStyle = {
    border: "1px solid #6AD4DD",
    padding: "0.5rem 1rem",
    textAlign: "center",
  };

  const buttonStyle = {
    padding: "0.5rem 1rem",
    fontSize: "1.2rem",
    backgroundColor: "#6AD4DD",
    border: "none",
    color: "black",
    cursor: "pointer",
    marginTop: "1rem",
  };

  const clickedNext = async () => {
    if (currentround === "10") {
      navigate(`/screen21/${pnumber}/${condition}`);
    } else {
      await axios
        .post(`${REACT_APP_BACKEND_URL}/generate/screen11reachedcountincrease`,{'token':localStorage.getItem('token')} ,{
          withCredentials: true,
        })
        .then(async (res) => {
          if (res.data.msg === "activeAtMoment") {
            console.log(15, res.data);
          }
          console.log(17, res.data);
          navigate(
            `/screen11/${pnumber}/${condition}/${res.data.activeatpg11}`
          );
        });
    }
  };

  return (
    <div style={containerStyle}>
      {currentround > 0 && currentround <= 10 && (
        <>
          <div
            style={{
              fontSize: "2rem",
              paddingBottom: "1rem",
              textAlign: "center",
            }}
          >
            <u>CUMULATIVE RESULTS | ROUND {currentround}</u>
          </div>
          {showFC && (
            <div>
              <div
                style={{
                  textAlign: "center",
                  fontSize: "1.4rem",
                  paddingBottom: "1rem",
                }}
              >
                Fixed Wage Compensation
              </div>
              <div style={{ fontSize: "1.2rem", paddingBottom: "1rem" }}>
                As Customer, you have earned a total of{" "}
                {lastRoundCumulativeComp} tokens in {currentround} round(s).
              </div>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Round</th>
                    <th style={thStyle}>Base Payoff</th>
                    <th style={thStyle}>Satisfaction from Worker’s Service</th>
                    <th style={thStyle}>Total Payoff</th>
                  </tr>
                </thead>
                <tbody>{renderTable()}</tbody>
              </table>
            </div>
          )}
          {showSC && (
            <div>
              <div
                style={{
                  textAlign: "center",
                  fontSize: "1.4rem",
                  paddingBottom: "1rem",
                }}
              >
                Service Charge Compensation
              </div>
              <div style={{ fontSize: "1.2rem", paddingBottom: "1rem" }}>
                As Customer, you have earned a total of{" "}
                {lastRoundCumulativeComp} tokens in {currentround} round(s).
              </div>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Round</th>
                    <th style={thStyle}>Base Payoff</th>
                    <th style={thStyle}>Satisfaction from Worker’s Service</th>
                    <th style={thStyle}>Service Charge Paid to the Worker</th>
                    <th style={thStyle}>Total Payoff</th>
                  </tr>
                </thead>
                <tbody>{renderTableSC()}</tbody>
              </table>
            </div>
          )}
          {showPre && (
            <div>
              <div
                style={{
                  textAlign: "center",
                  fontSize: "1.4rem",
                  paddingBottom: "1rem",
                }}
              >
                Pre-Service Tip Compensation
              </div>
              <div style={{ fontSize: "1.2rem", paddingBottom: "1rem" }}>
                As Customer, you have earned a total of{" "}
                {lastRoundCumulativeComp} tokens in {currentround} round(s).
              </div>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Round</th>
                    <th style={thStyle}>Base Payoff</th>
                    <th style={thStyle}>Satisfaction from Worker’s Service</th>
                    <th style={thStyle}>Tip Paid to the Worker</th>
                    <th style={thStyle}>Total Payoff</th>
                  </tr>
                </thead>
                <tbody>{renderTablePre()}</tbody>
              </table>
            </div>
          )}
          {showPost && (
            <div>
              <div
                style={{
                  textAlign: "center",
                  fontSize: "1.4rem",
                  paddingBottom: "1rem",
                }}
              >
                Post-Service Tip Compensation
              </div>
              <div style={{ fontSize: "1.2rem", paddingBottom: "1rem" }}>
                As Customer, you have earned a total of {lastRoundCumulativeComp} tokens
                in {currentround} round(s).
              </div>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Round</th>
                    <th style={thStyle}>Base Payoff</th>
                    <th style={thStyle}>Satisfaction from Worker’s Service</th>
                    <th style={thStyle}>Tip Paid to the Worker</th>
                    <th style={thStyle}>Total Payoff</th>
                  </tr>
                </thead>
                <tbody>{renderTablePost()}</tbody>
              </table>
            </div>
          )}
          <button style={buttonStyle} onClick={clickedNext}>
            Next
          </button>
        </>
      )}
    </div>
  );
}

export default Screen20;
