const express = require("express");
const Sessions = require("../models/Sessions");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Participants = require("../models/Participants");
const Rounds = require("../models/Rounds");
const Response = require('../models/Response')
const Match = require('../models/Match')
const mongoose = require('mongoose');
const util = require('util');
const verifyJwt = util.promisify(jwt.verify);

let links = {};
router.get('/', (req, res) => {
    res.send("hello from generatelink");
});

router.route("/link").post(async (req, res) => {
  try {
    const { participants, condition } = req.body;

    const uniqueLinkID = Math.random().toString(36).substring(7);
    const link = `https://project-sfa-env-frontend.vercel.app/link/${uniqueLinkID}`;

    const round = 10
    const savedSession = new Sessions({
      no_of_participants: participants,
      no_of_rounds:round,
      condition,
      link: uniqueLinkID,
    }).save();
    let halfParticipants = Math.floor(participants / 2);
    // console.log(17, halfParticipants)
    let categoriesA = Array(halfParticipants).fill("Customer");
    let categoriesB = Array(participants - halfParticipants).fill("Worker");

    let categories = categoriesA.concat(categoriesB);
    categories = categories.sort(() => Math.random() - 0.5);
    // console.log(28, categories)

    links[uniqueLinkID] = {
      participants: parseInt(participants),
      accesses: 0,
      categories: categories,
      accessedCategories: [],
    };

    console.log(`Link generated: ${link}`);
    // console.log(links[uniqueLinkID])

    const savedSessionId = (await savedSession)._id;
    // console.log(44, savedSessionId)
    const token = await jwt.sign(
      { _id: savedSessionId.toString() },
      "secretKey",
      {
        expiresIn: "1h",
      }
    );
    // console.log(48,token)

    var date = new Date();
    date.setTime(date.getTime() + 3600 * 2000);
    res.cookie("jwt", token, {
      httpOnly: true,
      expires: date,
    });
    const savedRound = await new Rounds({
      sessionId: savedSessionId,
      no_of_rounds: round,
      practiceRound:'NotStated',
      participants_reached_screen11:0,
      stage:0
    }).save();

    // console.log(66, savedRound);

    res.json({ link: link, token , msg: "generated" });
  } catch (e) {
    console.log("error in generatelink route");
    res.status(500).send("Internal Server Error");
  }
});

router.post("/page/:linkId", async (req, res) => {
  const { linkId } = req.params;

  let sessionObj = await Sessions.find({ link: linkId });
  sessionObj = sessionObj[0];

  // console.log(81, sessionObj)
  const sessionObjLink = sessionObj.link;
  const token = await jwt.sign({ link: sessionObjLink }, "secretKey", {
    expiresIn: "1h",
  });

  var date = new Date();
  date.setTime(date.getTime() + 3600 * 2000);

  if (!links[linkId]) {
    return res.status(404).send({ msg: "Link not found" });
  }

  const linkData = links[linkId];
  if (linkData.accesses >= linkData.participants) {
    return res.status(403).send({ msg: "Access limit reached" });
  }

  await Sessions.updateMany(
    {},
    { $set: { no_of_active_participants: linkData.accesses+1 } }
  );

  const categoryAssigned = linkData.categories[linkData.accesses];
  linkData.accessedCategories.push(categoryAssigned);
  linkData.accesses++;

  res.send({
    msg: "granted!",
    pnumber: linkData.accesses,
    token,
    categroy: categoryAssigned,
  });
});

router.post("/getlink", (req, res) => {
  const token = req.body.token;
  if (token === undefined || token == "") {
    //if token does not exist
    res.status(201).send({ msg: "access denied" });
  } else {
    jwt.verify(token, "secretKey", async (err, decodedToken) => {
      if (err) {
        //if wrong or tempered token exists
        console.log(req.data);
        res.status(201).send({ msg: "access denied" });
      }

      const _id = decodedToken._id;
      const sessionObj = await Sessions.findOne({ _id });
      res.status(201).send({ sessionObj, msg: "access granted" }); //if token matches
    });
  }
});

router.route("/addparticipant").post(async (req, res) => {
  const { pnumber, pname, assignedCategory, linkId } = req.body;

  try {
    // console.log(linkId)
    const sessionObj = await Sessions.findOne({ link: linkId });

    //   console.log(sessionObj)
    if (!sessionObj) {
      return res.status(404).send({ msg: "Session not found" });
    }

    //updating 'assignedCategory' in Round schema
    const roundDoc = await Rounds.findOne({ sessionId: sessionObj._id });
    if (!roundDoc) {
      return res.status(404).send({ msg: "Round not found" });
    }

    let participantDoc = await Participants.findOne({
      sessionId: sessionObj._id,
    });
    if (participantDoc) {
      // Document found, append the new participant
      participantDoc.participants.push({
        participant_number: pnumber,
        participant_name: pname,
        assigned_category: assignedCategory,
      });

      // Save the updated document
      const updatedDoc = await participantDoc.save();
      // console.log("Participant appended successfully:", updatedDoc);
      res.status(200).send({ msg: "granted!" });
    } else {
      // No document found, create a new one
      const newParticipant = new Participants({
        sessionId: sessionObj._id,
        participants: [
          {
            participant_number: pnumber,
            participant_name: pname,
            assigned_category: assignedCategory,
          },
        ],
      });

      const savedParticipant = await newParticipant.save();
      // console.log("New participant document created:", savedParticipant);
      res.status(201).send({ msg: "granted!" });
    }
  } catch (error) {
    console.error("Error in /addparticipant route:", error);
    res.status(500).send({ msg: "Internal server error" });
  }
});

router.route('/getassignedcategory').post(async (req,res)=>{
  const token = req.body.token;

  const pnumber = req.body.pnumber
  // Convert pnumber to a number
  const pnumberAsNumber = parseInt(pnumber, 10);
  // console.log(217, typeof(pnumberAsNumber))

  if (token === undefined || token == "") {
    //if token does not exist
    res.status(401).send({ msg: "access denied" });
  } else {
    jwt.verify(token, "secretKey", async (err, decodedToken) => {
      if (err) {
        //if wrong or tempered token exists
        res.status(201).send({ msg: "access denied" });
      }

      const link = decodedToken.link;
      const sessionObj = await Sessions.findOne({ link });

      const participantObj = await Participants.findOne({ sessionId: sessionObj._id})
      // console.log(227, participantObj.participants)
      let assignedCategory = null;

      if (participantObj) {
        for (const participant of participantObj.participants) {
          if (participant.participant_number === pnumberAsNumber) { 
            assignedCategory = participant.assigned_category;
            break; // Exit the loop once the match is found
          }
        }
      }
      res.status(201).send({ assignedCategory, msg: "positive" }); //if token matches
    });
  }
})

router.post('/getconditionandrole', async(req,res)=>{
  const token = req.body.token;
  if (token === undefined || token == "") {
    //if token does not exist
    res.status(401).send({ msg: "access denied" });
  } else {
    jwt.verify(token, "secretKey", async (err, decodedToken) => {
      if (err) {
        //if wrong or tempered token exists
        res.status(201).send({ msg: "access denied" });
      }

      const link = decodedToken.link;
      const sessionObj = await Sessions.findOne({ link });

      const condition = sessionObj.condition
      res.status(201).send({ condition, msg: "positive" }); //if token matches
    });
  }
})

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

router.post('/screen11reachedcountincrease', async (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res.status(401).send({ msg: "Access denied" });
  }

  jwt.verify(token, "secretKey", async (err, decodedToken) => {
    if (err) {
      return res.status(401).send({ msg: "Access denied" });
    }

    try {
      const link = decodedToken.link;
      const sessionObj = await Sessions.findOne({ link });
      if (!sessionObj) {
        throw new Error('Session not found');
      }

      let sessionId = sessionObj._id.toHexString();
      const session = await Sessions.findById(sessionId);
      const round = await Rounds.findOne({ sessionId });
      
      if (!round || !session) {
        throw new Error('Round or Session not found');
      }

      // Increment participants_reached_screen11 and update round details in a single operation
      const rounds = ['practice_round', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const roundDetailsUpdate = {};

      for (const roundName of rounds) {
        roundDetailsUpdate[`round_details.${roundName}`] = { status: 'inactive' };
      }

      const updatedRound = await Rounds.findOneAndUpdate(
        { sessionId },
        { 
          $inc: { participants_reached_screen11: 1 },
        },
        { new: true }  // This returns the updated document
      );
      console.log(300, updatedRound.participants_reached_screen11, " ", session.no_of_participants)
      // Check if participants_reached_screen11 has reached the required count to proceed with matching
      if (updatedRound.participants_reached_screen11 >= session.no_of_participants) {
        // Check if a match document already exists for this sessionId
        const existingMatch = await Match.findOne({ sessionId });
        if (existingMatch) {
          return res.status(200).send({ msg: "Matches already exist", activeatpg11: updatedRound.participants_reached_screen11 });
        }

        const participantDoc = await Participants.findOne({ sessionId });
        if (!participantDoc) {
          return res.status(404).send({ msg: "Participants not found" });
        }

        // Separate participants into workers and customers
        let workers = participantDoc.participants.filter(p => p.assigned_category === 'Worker');
        let customers = participantDoc.participants.filter(p => p.assigned_category === 'Customer');
   
        console.log(318, workers)
        console.log(319, customers)
        // Create matches for different rounds
        const matchesByRound = {};

        for (const roundName of rounds) {
          let shuffledWorkers = shuffleArray([...workers]);
          let shuffledCustomers = shuffleArray([...customers]);

          const matches = [];
          const usedWorkers = new Set();
          const usedCustomers = new Set();

          // Create matches ensuring unique pairings
          while (shuffledWorkers.length > 0 && shuffledCustomers.length > 0) {
            const worker = shuffledWorkers.pop();
            const customerIndex = shuffledCustomers.findIndex(c => !usedCustomers.has(c.participant_number));
            
            if (customerIndex !== -1) {
              const customer = shuffledCustomers[customerIndex];
              matches.push({ worker: worker.participant_number, customer: customer.participant_number, round: roundName });
              usedWorkers.add(worker.participant_number);
              usedCustomers.add(customer.participant_number);

              shuffledCustomers.splice(customerIndex, 1);
            } else {
              break;
            }
          }

          matchesByRound[roundName] = matches;
        }

        // Save new matches to Matches collection only if no existing match was found
        const matchRecord = new Match({
          sessionId: sessionId,
          matches: matchesByRound
        });
        console.log(380, matchRecord)
        await matchRecord.save();

        res.status(201).send({ msg: 'Matches created', activeatpg11: updatedRound.participants_reached_screen11, matches: matchesByRound });
      } else {
        res.status(201).send({ activeatpg11: updatedRound.participants_reached_screen11, msg: "activeAtMoment" });
      }
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).send({ msg: 'Internal Server Error' });
    }
  });
});

router.post('/resetScreen11Count', async (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res.status(401).send({ msg: "Access denied" });
  }

  jwt.verify(token, "secretKey", async (err, decodedToken) => {
    if (err) {
      return res.status(401).send({ msg: "Access denied" });
    }

    try {
      // console.log(405, decodedToken)
      const link = decodedToken.link;
      const sessionObj = await Sessions.findOne({ link });
      if (!sessionObj) {
        throw new Error('Session not found');
      }
      // console.log(410, sessionObj)
      let sessionId = sessionObj._id.toHexString();
// console.log(411, sessionId)
      // Reset participants_reached_screen11 to 0
      await Rounds.findOneAndUpdate(
        { sessionId },
        { $set: { participants_reached_screen11: 0 } },
        { new: true }
      );
    
      res.status(200).send({ msg: 'Participants count reset to 0' });
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).send({ msg: 'Internal Server Error' });
    }
  });
});

router.post('/getroundnumber',async(req,res)=>{
  const token = req.body.token;
  if (token === undefined || token == "") {
    //if token does not exist
    res.status(401).send({ msg: "access denied" });
  } else {
    jwt.verify(token, "secretKey", async (err, decodedToken) => {
      if (err) {
        //if wrong or tempered token exists
        res.status(201).send({ msg: "access denied" });
      }
      const link = decodedToken.link;
      const sessionObj = await Sessions.findOne({ link });
      let sessionId = await sessionObj._id
      sessionId = sessionId.toHexString();

      const round = await Rounds.findOne({ sessionId });

      // Logic to update current_round
      let currentRound = round.current_round;
      res.status(201).send({ currentRound, msg: "positive" }); //if token matches
    });
  }
})

router.route('/updateroundnumber').post(async (req, res) => {
  const token = req.body.token;

  if (!token) {
      // If token does not exist
      return res.status(401).send({ msg: "access denied" });
  }

  try {
      // Verifying the JWT token
      const decodedToken = jwt.verify(token, "secretKey");
      const currentround = req.body.currentround;
      const link = decodedToken.link;

      // Fetching the session object
      const sessionObj = await Sessions.findOne({ link });
      if (!sessionObj) {
          return res.status(404).send({ msg: "session not found" });
      }

      const sessionId = sessionObj._id.toHexString();
      console.log(494, currentround)
      // Updating the current_round in Rounds collection
      const updateResult = await Rounds.findOneAndUpdate(
          { sessionId },
          { $set: { current_round: currentround } }, // Update operation
          { new: true } 
      );
      console.log(502,updateResult)

      if (!updateResult) {
          return res.status(404).send({ msg: "round not found" });
      }

      res.status(200).send({ msg: "updated successfully", round: updateResult });
  } catch (err) {
      // If wrong or tempered token exists
      res.status(401).send({ msg: "access denied" });
  }
});

router.route('/matchingnumber').post(async (req,res)=>{
  const token = req.cookies.jwt;
  let pnumber = req.body.pnumber;

  if(!token){
    return res.status(401).send({msg:'access denied'});
  }else{
    jwt.verify(token, 'secretkey', async(err, decodedToken)=>{
      if(err){
        return res.status(401).send({msg:'access denied'})
      }
      const link = decodedToken.link;
      const sessionObj = await Sessions.findOne({link})

      if(!sessionObj){
        return res.status(401).send({msg:'Session not found'})
      }

      let sessionId = sessionObj._id.toHexString();
      const match = await Match.findOne({sessionId})

      if(!match){
        return res.status(401).send({msg:'Match not found'})
      }

      const matches = match.matches || new Map(); // Initialize if undefined
      currentround = currentround.toString();
      pnumber = Number(pnumber);

      if (currentround === '0') {
        currentround = 'practice_round';
      }

      let roundEntries = matches.get(currentround) || [];  // Get current round data or an empty array

      // Find the entry for the given worker
      const entryIndex = roundEntries.findIndex(entry => entry.worker === pnumber);

      console.log(552, matches)
      console.log(553, entryIndex)
    })
  }
})

router.post('/addeffortlevel', async (req, res) => {
  const token = req.body.token;
  let { pnumber, currentround, effortlevel, condition } = req.body;

  if (!token) {
    return res.status(401).send({ msg: "Access denied" });
  }

  try {
    const decodedToken = await verifyJwt(token, "secretKey");

    const link = decodedToken.link;
    const sessionObj = await Sessions.findOne({ link });
    if (!sessionObj) {
      return res.status(404).send({ msg: "Session not found" });
    }
    
    let sessionId = sessionObj._id.toHexString();
    
    const match = await Match.findOne({ sessionId });

    if (!match) {
      return res.status(404).send({ msg: "Match not found" });
    }

    const matches = match.matches; 
    // console.log(544, currentround)
    if(currentround == 'Practice Round'){currentround = 'practice_round'}
    const roundEntries = matches.get(currentround);
    // console.log(557, roundEntries)
    if (!roundEntries) {
      return res.status(404).send({ msg: "Current round entries not found" });
    }

    const entry = roundEntries.find(entry => entry.worker == pnumber);
    if (!entry) {
      return res.status(404).send({ msg: "Participant not found" });
    }
    // console.log(558, effortlevel)
    // Update only the effortlevel
    entry.effort = effortlevel;
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
    const effortTokens = Number(effortToTokens[effortlevel]) || 0; 
    if(condition == 'Fixed Condition'){
      entry.totalComp = 200 - effortTokens;
    }
    else if(condition == 'Service Charge'){
      entry.totalComp = 160 + 40 - effortTokens
    }

    // Save the document
    await match.save();

    res.status(200).send({ msg: "Effort level updated successfully" });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).send({ msg: "Access denied" });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).send({ msg: "Validation Error", details: err.errors });
    }
    console.error("Error in addeffortlevel API:", err);
    return res.status(500).send({ msg: "Internal Server Error" });
  }
});


router.route('/addworkertip').post(async (req, res) => {
  const token = req.body.token;
  let { pnumber, tip, currentround } = req.body;

  if (!token) {
    return res.status(401).send({ msg: "access denied" });
  }

  jwt.verify(token, "secretKey", async (err, decodedToken) => {
    if (err) {
      return res.status(201).send({ msg: "access denied" });
    }

    const link = decodedToken.link;
    const sessionObj = await Sessions.findOne({ link });
    const sessionId = sessionObj._id.toHexString();
    const match = await Match.findOne({ sessionId });

    if (!match) {
      return res.status(404).send({ msg: "Match not found" });
    }

    let matches = match.matches;
    currentround = currentround === 'Practice Round' ? 'practice_round' : currentround.toString();
    pnumber = Number(pnumber);

    if (matches.has(currentround)) {
      const roundEntries = matches.get(currentround);

      if (!Array.isArray(roundEntries)) {
        return res.status(500).send({ msg: "Round entries are not in expected format" });
      }
      const updatedEntries = roundEntries.map(entry => {
        if (entry.customer === pnumber) {
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
          const effortTokens = Number(effortToTokens[entry.effort]) || 0; 
          return { ...entry, pretip:tip, totalComp: 60 + Number(tip) - Number(effortTokens) }; // Update the tip in the entry
        }
        return entry; // Return unchanged entry
      });  
      // Update the matches object
      matches.set(currentround, updatedEntries);
      // Save the updated match document
      await match.save();

      return res.status(201).send({ msg: "Tip updated successfully" });
    } else {
      return res.status(404).send({ msg: "Round not found" });
    }
  });
});

// router.route('/addworkertippost').post(async (req, res) => {
//   const token = req.cookies.jwt;
//   let { pnumber, tip, currentround } = req.body;

//   if (!token) {
//     return res.status(401).send({ msg: "access denied" });
//   }

//   jwt.verify(token, "secretKey", async (err, decodedToken) => {
//     if (err) {
//       return res.status(201).send({ msg: "access denied" });
//     }

//     const link = decodedToken.link;
//     const sessionObj = await Sessions.findOne({ link });
//     const sessionId = sessionObj._id.toHexString();
//     const match = await Match.findOne({ sessionId });

//     if (!match) {
//       return res.status(404).send({ msg: "Match not found" });
//     }

//     let matches = match.matches;
//     currentround = currentround === 'Practice Round' ? 'practice_round' : currentround.toString();
//     pnumber = Number(pnumber);

//     if (matches.has(currentround)) {
//       const roundEntries = matches.get(currentround);

//       if (!Array.isArray(roundEntries)) {
//         return res.status(500).send({ msg: "Round entries are not in expected format" });
//       }
//       const updatedEntries = roundEntries.map(entry => {
//         if (entry.customer === pnumber) {
//           return { ...entry, posttip:tip }; // Update the tip in the entry
//         }
//         return entry; // Return unchanged entry
//       });  
//       // Update the matches object
//       matches.set(currentround, updatedEntries);
//       // console.log(623, matches)
//       // Save the updated match document
//       await match.save();

//       return res.status(201).send({ msg: "Tip updated successfully" });
//     } else {
//       return res.status(404).send({ msg: "Round not found" });
//     }
//   });
// });

router.route('/geteffortlevel').post(async(req,res)=>{
  const token = req.body.token;
  let { pnumber, currentround } = req.body;

  if (currentround === 'Practice Round') {
    currentround = 0;
  }

  if (token === undefined || token === "") {
    // If token does not exist
    return res.status(401).send({ msg: "Access denied" });
  }

  jwt.verify(token, "secretKey", async (err, decodedToken) => {
    if (err) {
      // If the token is invalid
      return res.status(401).send({ msg: "Access denied" });
    }

    const link = decodedToken.link;
    const sessionObj = await Sessions.findOne({ link });

    if (!sessionObj) {
      return res.status(404).send({ msg: "Session not found" });
    }

    let sessionId = sessionObj._id.toHexString();

    const match = await Match.findOne({ sessionId });

    if (!match) {
      return res.status(404).send({ msg: "Match not found" });
    }

    const matches = match.matches;
    currentround = currentround.toString();
    pnumber = Number(pnumber);

    if (currentround === '0') {
      currentround = 'practice_round';
    }
    
    if (matches.has(currentround)) {
      const roundEntries = matches.get(currentround);
      if (!Array.isArray(roundEntries)) {
        return res.status(500).send({ msg: "Round entries are not in expected format" });
      }

      let entryFound = false;
      let updatedEffort = null;

      roundEntries.forEach(entry => {
        // console.log(111,entry.worker, pnumber)
        if (entry.customer === pnumber) {
          updatedEffort = entry.effort; // Retrieve the existing tip
          entryFound = true;
        }
      });
      if (!entryFound) {
        return res.status(404).send({ msg: "Worker not found in the current round" });
      }
      
      return res.status(200).send({ msg: "Effort retrieved successfully", effort: updatedEffort });
    } else {
      return res.status(404).send({ msg: "Round not found" });
    }
  });
})
router.route('/geteffortlevelworker').post(async(req,res)=>{
  const token = req.body.token;
  let { pnumber, currentround } = req.body;

  if (currentround === 'Practice Round') {
    currentround = 0;
  }

  if (token === undefined || token === "") {
    // If token does not exist
    return res.status(401).send({ msg: "Access denied" });
  }

  jwt.verify(token, "secretKey", async (err, decodedToken) => {
    if (err) {
      // If the token is invalid
      return res.status(401).send({ msg: "Access denied" });
    }

    const link = decodedToken.link;
    const sessionObj = await Sessions.findOne({ link });

    if (!sessionObj) {
      return res.status(404).send({ msg: "Session not found" });
    }

    let sessionId = sessionObj._id.toHexString();

    const match = await Match.findOne({ sessionId });

    if (!match) {
      return res.status(404).send({ msg: "Match not found" });
    }

    const matches = match.matches;
    currentround = currentround.toString();
    pnumber = Number(pnumber);
    if (currentround === '0') {
      currentround = 'practice_round';
    }
    if (matches.has(currentround)) {
      const roundEntries = matches.get(currentround);
      if (!Array.isArray(roundEntries)) {
        return res.status(500).send({ msg: "Round entries are not in expected format" });
      }

      let updatedEffort = null;
      let tip = null;
      roundEntries.forEach(entry => {
        if (entry.worker === pnumber) {
          // console.log(828, entry)
          updatedEffort = entry.effort; // Retrieve the existing tip
          tip = entry.pretip
        }
      });
      return res.status(200).send({ msg: "Effort retrieved successfully", effort: updatedEffort, pretip:tip });
    } else {
      return res.status(404).send({ msg: "Round not found" });
    }
  });
})

router.post('/getroundinfo', async(req,res)=>{
  const token = req.body.token;
  let { pnumber, currentround } = req.body;

  if (currentround === 'Practice Round') {
    currentround = 0;
  }

  if (token === undefined || token === "") {
    // If token does not exist
    return res.status(401).send({ msg: "Access denied" });
  }

  jwt.verify(token, "secretKey", async (err, decodedToken) => {
    if (err) {
      // If the token is invalid
      return res.status(401).send({ msg: "Access denied" });
    }

    const link = decodedToken.link;
    const sessionObj = await Sessions.findOne({ link });

    if (!sessionObj) {
      return res.status(404).send({ msg: "Session not found" });
    }

    let sessionId = sessionObj._id.toHexString();

    const match = await Match.findOne({ sessionId });

    if (!match) {
      return res.status(404).send({ msg: "Match not found" });
    }

    const matches = match.matches;
    currentround = currentround.toString();
    pnumber = Number(pnumber);

    if (currentround === '0') {
      currentround = 'practice_round';
    }
    if (matches.has(currentround)) {
      const roundEntries = matches.get(currentround);
      if (!Array.isArray(roundEntries)) {
        return res.status(500).send({ msg: "Round entries are not in expected format" });
      }

      roundEntries.forEach(entry => {
        console.log(111,entry.worker, pnumber)
        if (entry.customer == pnumber) {
          return res.status(201).send({msg:'entry retrived', entry})     
        }
      });
      
    } else {
      return res.status(404).send({ msg: "Round not found" });
    }
  });
})

router.post('/matchpnumber', async (req, res) => {
  const token = req.body.token;
  let { pnumber, currentround } = req.body;
  if(currentround == 'Practice Round'){currentround = 'practice_round'}
  if (token === undefined || token === "") {
    // If token does not exist
    return res.status(401).send({ msg: "Access denied" });
  }

  jwt.verify(token, "secretKey", async (err, decodedToken) => {
    console.log(824)
    if (err) {
      // If the token is invalid
      return res.status(401).send({ msg: "Access denied" });
    }

    const link = decodedToken.link;
    const sessionObj = await Sessions.findOne({ link });

    if (!sessionObj) {
      return res.status(404).send({ msg: "Session not found" });
    }

    let sessionId = sessionObj._id.toHexString();

    const match = await Match.findOne({ sessionId });

    if (!match) {
      return res.status(404).send({ msg: "Match not found" });
    }

    const matches = match.matches; 
    const roundEntries = matches.get(currentround);
    
    const entry = roundEntries.find(entry => entry.worker == pnumber);
    return res.status(200).send({ msg: "Pair found", participant: entry.customer });
  })
});

router.post('/matchpnumberforcustomer', async (req, res) => {
  const token = req.body.token;
  let { pnumber, currentround } = req.body;
  if(currentround == 'Practice Round'){currentround = 'practice_round'}
  if (token === undefined || token === "") {
    // If token does not exist
    return res.status(401).send({ msg: "Access denied" });
  }

  jwt.verify(token, "secretKey", async (err, decodedToken) => {
    if (err) {
      // If the token is invalid
      return res.status(401).send({ msg: "Access denied" });
    }

    const link = decodedToken.link;
    const sessionObj = await Sessions.findOne({ link });

    if (!sessionObj) {
      return res.status(404).send({ msg: "Session not found" });
    }

    let sessionId = sessionObj._id.toHexString();

    const match = await Match.findOne({ sessionId });

    if (!match) {
      return res.status(404).send({ msg: "Match not found" });
    }

    const matches = match.matches; 
    const roundEntries = matches.get(currentround);
    
    const entry = roundEntries.find(entry => entry.customer == pnumber);
    // console.log(936, entry.customer)
    return res.status(200).send({ msg: "Pair found", participant: entry.worker });
  })
});

router.route('/gettip').post(async(req,res)=>{
  const token = req.body.token;
  let { pnumber, currentround } = req.body;

  if (currentround === 'Practice Round') {
    currentround = 0;
  }

  if (token === undefined || token === "") {
    // If token does not exist
    return res.status(401).send({ msg: "Access denied" });
  }

  jwt.verify(token, "secretKey", async (err, decodedToken) => {
    if (err) {
      // If the token is invalid
      return res.status(401).send({ msg: "Access denied" });
    }

    const link = decodedToken.link;
    const sessionObj = await Sessions.findOne({ link });

    if (!sessionObj) {
      return res.status(404).send({ msg: "Session not found" });
    }

    let sessionId = sessionObj._id.toHexString();

    const match = await Match.findOne({ sessionId });

    if (!match) {
      return res.status(404).send({ msg: "Match not found" });
    }

    const matches = match.matches;
    currentround = currentround.toString();
    pnumber = Number(pnumber);

    if (currentround === '0') {
      currentround = 'practice_round';
    }
    
    if (matches.has(currentround)) {
      // console.log(557, currentround)
      const roundEntries = matches.get(currentround);
      // console.log(roundEntries)
      if (!Array.isArray(roundEntries)) {
        return res.status(500).send({ msg: "Round entries are not in expected format" });
      }

      let entryFound = false;
      let updatedTip = null;

        roundEntries.forEach(entry => {
          // console.log(111,entry.worker, pnumber)
          if (entry.customer === pnumber) {
            // console.log(716, entry)
            updatedTip = entry.pretip; // Retrieve the existing tip
            entryFound = true;
          }
        });
  

      if (!entryFound) {
        return res.status(404).send({ msg: "Worker not found in the current round" });
      }
      // console.log(845, updatedTip)
      return res.status(200).send({ msg: "Tip retrieved successfully", tip: updatedTip });
    } else {
      return res.status(404).send({ msg: "Round not found" });
    }
  });
})

router.route('/gettipforworker').post(async(req,res)=>{
  const token = req.body.token;
  let { pnumber, currentround } = req.body;

  if (currentround === 'Practice Round') {
    currentround = 0;
  }

  if (token === undefined || token === "") {
    // If token does not exist
    return res.status(401).send({ msg: "Access denied" });
  }

  jwt.verify(token, "secretKey", async (err, decodedToken) => {
    if (err) {
      // If the token is invalid
      return res.status(401).send({ msg: "Access denied" });
    }

    const link = decodedToken.link;
    const sessionObj = await Sessions.findOne({ link });

    if (!sessionObj) {
      return res.status(404).send({ msg: "Session not found" });
    }

    let sessionId = sessionObj._id.toHexString();

    const match = await Match.findOne({ sessionId });

    if (!match) {
      return res.status(404).send({ msg: "Match not found" });
    }

    const matches = match.matches;
    currentround = currentround.toString();
    pnumber = Number(pnumber);

    if (currentround === '0') {
      currentround = 'practice_round';
    }
    
    if (matches.has(currentround)) {
      // console.log(557, currentround)
      const roundEntries = matches.get(currentround);
      // console.log(roundEntries)
      if (!Array.isArray(roundEntries)) {
        return res.status(500).send({ msg: "Round entries are not in expected format" });
      }

      let entryFound = false;
      let updatedTip = null;

        roundEntries.forEach(entry => {
          // console.log(111,entry.worker, pnumber)
          if (entry.worker === pnumber) {
            // console.log(716, entry)
            updatedTip = entry.pretip; // Retrieve the existing tip
            entryFound = true;
          }
        });
  

      if (!entryFound) {
        return res.status(404).send({ msg: "Worker not found in the current round" });
      }
      // console.log(845, updatedTip)
      return res.status(200).send({ msg: "Tip retrieved successfully", tip: updatedTip });
    } else {
      return res.status(404).send({ msg: "Round not found" });
    }
  });
})


router.route('/gettippost').post(async(req,res)=>{
  const token = req.cookies.jwt;
  let { pnumber, currentround } = req.body;

  if (currentround === 'Practice Round') {
    currentround = 0;
  }

  if (token === undefined || token === "") {
    // If token does not exist
    return res.status(401).send({ msg: "Access denied" });
  }

  jwt.verify(token, "secretKey", async (err, decodedToken) => {
    if (err) {
      // If the token is invalid
      return res.status(401).send({ msg: "Access denied" });
    }

    const link = decodedToken.link;
    const sessionObj = await Sessions.findOne({ link });

    if (!sessionObj) {
      return res.status(404).send({ msg: "Session not found" });
    }

    let sessionId = sessionObj._id.toHexString();

    const match = await Match.findOne({ sessionId });

    if (!match) {
      return res.status(404).send({ msg: "Match not found" });
    }

    const matches = match.matches;
    currentround = currentround.toString();
    pnumber = Number(pnumber);

    if (currentround === '0') {
      currentround = 'practice_round';
    }
    
    if (matches.has(currentround)) {
      // console.log(557, currentround)
      const roundEntries = matches.get(currentround);
      // console.log(roundEntries)
      if (!Array.isArray(roundEntries)) {
        return res.status(500).send({ msg: "Round entries are not in expected format" });
      }

      let entryFound = false;
      let updatedTip = null;

        roundEntries.forEach(entry => {
          // console.log(111,entry.worker, pnumber)
          if (entry.customer === pnumber) {
            // console.log(716, entry)
            updatedTip = entry.posttip; // Retrieve the existing tip
            entryFound = true;
          }
        });

      if (!entryFound) {
        return res.status(404).send({ msg: "Worker not found in the current round" });
      }
      return res.status(200).send({ msg: "Tip retrieved successfully", tip: updatedTip });
    } else {
      return res.status(404).send({ msg: "Round not found" });
    }
  });
})

router.post('/selectonecustomer', async (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res.status(401).send({ msg: "access denied" });
  }

  jwt.verify(token, "secretKey", async (err, decodedToken) => {
    if (err) {
      return res.status(401).send({ msg: "access denied" });
    }

    const link = decodedToken.link;
    const sessionObj = await Sessions.findOne({ link });
    if (!sessionObj) {
      return res.status(404).send({ msg: "session not found" });
    }

    const sessionId = sessionObj._id.toHexString();
    const participantObj = await Participants.find({ sessionId });

    if (!participantObj || participantObj.length === 0 || !participantObj[0].participants) {
      return res.status(404).send({ msg: "participants not found" });
    }

    const customerParticipants = participantObj[0].participants.filter(p => p.assigned_category === 'Customer');
    if (customerParticipants.length === 0) {
      return res.status(404).send({ msg: "no customers found" });
    }

    const selectedParticipant = customerParticipants[0];

    res.status(201).send({ selectedParticipant, msg: "positive" });
  });
});

router.post("/fetchsummary", async (req, res) => {
  const token = req.body.token;
  
  if (!token) {
    return res.status(401).send({ msg: "access denied" });
  } 

  jwt.verify(token, "secretKey", async (err, decodedToken) => {
    if (err) {
      return res.status(403).send({ msg: "access denied" });
    }

    try {
      const link = decodedToken.link;
      const sessionObj = await Sessions.findOne({ link });
  
      if (!sessionObj) {
        return res.status(404).send({ msg: "Session not found" });
      }
  
      let sessionId = sessionObj._id.toHexString();
  
      if (!sessionId) {
        return res.status(400).send({ msg: "sessionId is required" });
      }

      const matches = await Match.findOne({ sessionId });

      if (!matches) {
        return res.status(404).send({ msg: "No matches found for the given sessionId" });
      }

      res.status(200).send({ matches });
    } catch (error) {
      console.error("Error fetching matches:", error);
      res.status(500).send({ msg: "Internal server error" });
    }
  });
});

router.post('/saveresponses', async (req, res) => {
  const token = req.body.token;
  const { pnumber, condition, EffortSensitivity_Manager, EffortSensitivity_Customer, Observability_Manager, Observability_Customer, MentalAccount } = req.body;

  if (!token) {
    return res.status(401).send({ msg: "Access denied" });
  }

  jwt.verify(token, "secretKey", async (err, decodedToken) => {
    if (err) {
      return res.status(403).send({ msg: "Access denied" });
    }

    try {
      const link = decodedToken.link;
      const sessionObj = await Sessions.findOne({ link });
      const sessionId = sessionObj._id.toHexString();

      // Create a new response document
      const newResponse = new Response({
        sessionId,
        pnumber,
        condition,
        EffortSensitivity_Manager,
        EffortSensitivity_Customer,
        Observability_Manager,
        Observability_Customer,
        ...(condition === 'Service Charge' && { MentalAccount }), // Include MentalAccount if condition is Service Charge
        sessionLink: link
      });

      // Save the response in the database
      await newResponse.save();

      res.status(200).send({ msg: 'Response saved successfully' });
    } catch (error) {
      console.error("Error saving response:", error);
      res.status(500).send({ msg: "Internal server error" });
    }
  });
});

router.post('/saveresponsesforscreen23', async (req, res) => {
  const token = req.body.token;
  const { pnumber, condition, Controllability1, Controllability2, TipReason_Effort, TipReason_SocialImage, TipReason_SocialNorm } = req.body;

  if (!token) {
    return res.status(401).send({ msg: "Access denied" });
  }

  jwt.verify(token, "secretKey", async (err, decodedToken) => {
    if (err) {
      return res.status(403).send({ msg: "Access denied" });
    }

    try {
      const link = decodedToken.link;
      const sessionObj = await Sessions.findOne({ link });
      const sessionId = sessionObj._id.toHexString();

      const existingResponse = await Response.findOne({ pnumber, sessionId });

      if (!existingResponse) {
        return res.status(404).send({ msg: "Response not found" });
      }
      console.log(1253, existingResponse)
      existingResponse.controllability1 = Controllability1;
      existingResponse.controllability2 = Controllability2;
      existingResponse.TipReason_Effort = TipReason_Effort;
      existingResponse.TipReason_SocialImage = TipReason_SocialImage;
      existingResponse.TipReason_SocialNorm = TipReason_SocialNorm;

      await existingResponse.save();

      res.status(200).send({ msg: 'Response updated successfully' });
    } catch (error) {
      console.error("Error saving response:", error);
      res.status(500).send({ msg: "Internal server error" });
    }
  });
});

router.post('/postresponse', async (req, res) => {
  const token = req.body.token;
  const { pnumber, condition, response } = req.body;

  if (!token) {
    return res.status(401).send({ msg: "Access denied" });
  }

  jwt.verify(token, "secretKey", async (err, decodedToken) => {
    if (err) {
      return res.status(403).send({ msg: "Access denied" });
    }

    try {
      const link = decodedToken.link;
      const sessionObj = await Sessions.findOne({ link });
      const sessionId = sessionObj._id.toHexString();

      const existingResponse = await Response.findOne({ pnumber, sessionId });

      if (!existingResponse) {
        const newResponse = new Response({
          sessionId,
          pnumber,
          condition,
          response
        });
  
        // Save the response in the database
        await newResponse.save();
  
        res.status(200).send({ msg: 'Response saved successfully' });
      }
      console.log(1253, existingResponse)
      existingResponse.response = response;

      await existingResponse.save();

      res.status(200).send({ msg: 'Response updated successfully' });
    } catch (error) {
      console.error("Error saving response:", error);
      res.status(500).send({ msg: "Internal server error" });
    }
  });
});


module.exports = router;
