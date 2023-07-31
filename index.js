const express = require("express");
const app = express();
const cors = require("cors");
const { ethers } = require("ethers");
const jwt = require("jsonwebtoken");
require("dotenv").config();
//============SERVER CONFIG=================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// const provider = new ethers.JsonRpcProvider(
//     "https://cloudflare-eth.com"
const provider = new ethers.JsonRpcProvider(
	"https://ethereum-goerli.publicnode.com"
);

//============FIREBASE CONFIG=================

const { initializeApp } = require("firebase/app");
const {
	getFirestore,
	doc,
	updateDoc,
	increment,
	collection,
	query,
	where,
} = require("firebase/firestore");

const firebaseConfig = {
	apiKey: process.env.FIREBASE_KEY,
	authDomain: "horse-racing-cd020.firebaseapp.com",
	projectId: "horse-racing-cd020",
	storageBucket: "horse-racing-cd020.appspot.com",
	messagingSenderId: "568621899844",
	appId: "1:568621899844:web:fb432a9e24b4b0f6cb9c11",
	measurementId: "G-E5X0ZD67JC",
};

const appFirebase = initializeApp(firebaseConfig);
const db = getFirestore(appFirebase);

//=====================HANDLE WITH FIREBASE================

const deposit = async (id, amount) => {
	try {
		if (!id || !amount) return;
		const userRef = doc(db, "users", id);
		await updateDoc(userRef, {
			balance: increment(amount),
		});
		return true;
	} catch (error) {
		return false;
	}
};

const checkTxhash = async (txhash) => {
	const collectionRef = query(
		collection(db, "deposit"),
		where("txhash", "==", txhash)
	);
	try {
		const data = await getDocs(collectionRef);
		if (data) {
			return data?.docs?.map((doc) => ({ ...doc?.data(), id: doc?.id }));
		}
	} catch (error) {
		return false;
	}
};

const confirmDeposit = async (id) => {
	try {
		if (!id) return;
		const userRef = doc(db, "deposit", id);
		await updateDoc(userRef, {
			status: true,
		});
		return true;
	} catch (error) {
		return false;
	}
};

app.use((req, res, next) => {
	const authHeader = req.headers["authorization"];
	if (typeof authHeader !== "undefined") {
		const token = authHeader.split(" ")[1];
		req.token = token;
	}
	next();
});
app.get("/", (req, res) => {
	res.json({ status: true });
});
app.post("/api/test", async (req, res) => {
	if (!req.body) {
		res.status(403).json({ status: "false" });
	} else {
		res.status(200).json({ status: "true" });
	}
});
app.post("/api/getToken", async (req, res) => {
	try {
		if (!req.body) {
			res.status(403);
		}
		token = jwt.sign(req.body, process.env.JWT_SECRET);
		res.json({ token: token });
	} catch (error) {
		res.status(403);
	}
});

app.post("/api/deposit", async (req, res) => {
	req.setTimeout(120000);
	if (!req.token) {
		return res.status(403).json({ error: "Not access!" });
	}
	try {
		const data = jwt.verify(req.token, process.env.JWT_SECRET);
		const { id, txhash, amount, idDeposit } = data;
		const _checkTxhash = await checkTxhash(txhash);

		if (_checkTxhash && _checkTxhash.length == 0) {
			res.status(404);
		}
		if (!data.id || !data.txhash || !data.amount | !data.idDeposit) {
			res.status(403);
		}
		setTimeout(async () => {
			const _tx = await provider.waitForTransaction(txhash);
			if (_tx.status == 1) {
				try {
					await deposit(id, amount);
					await confirmDeposit(idDeposit);
					res.json({ status: true });
				} catch (error) {
					return res.status(404);
				}
			} else {
				return res.status(404);
			}
		}, 10000);
	} catch (error) {
		console.log("Error: ", error);
		res.json(403);
	}
});

app.listen(3000);
