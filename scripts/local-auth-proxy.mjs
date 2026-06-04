/**
 * Local dev login proxy (Node only — no npm deps).
 * Bypasses browser API-key referrer restrictions.
 *
 * Requires firebase-service-account.json in project root.
 * Run: node scripts/local-auth-proxy.mjs
 */
import http from "http";
import crypto from "crypto";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PORT = 8787;
const API_KEY = "AIzaSyCWbI7XXxoW5QYB_MD_YFXtnQOi7yhA-HE";
const SERVICE_ACCOUNT_PATH = join(ROOT, "firebase-service-account.json");

let serviceAccount = null;

if (existsSync(SERVICE_ACCOUNT_PATH)) {
    serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, "utf8"));
    console.log("SafeMe auth proxy: service account loaded");
} else {
    console.warn(
        "Missing firebase-service-account.json — see FIREBASE_ADMIN_SETUP.md Option B"
    );
}

function base64url(input) {
    return Buffer.from(input)
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}

function createCustomToken(uid, sa) {
    const header = { alg: "RS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        iss: sa.client_email,
        sub: sa.client_email,
        aud:
            "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit",
        iat: now,
        exp: now + 3600,
        uid: uid,
    };

    const segments = [
        base64url(JSON.stringify(header)),
        base64url(JSON.stringify(payload)),
    ];
    const signInput = segments.join(".");
    const sign = crypto.createSign("RSA-SHA256");
    sign.update(signInput);
    sign.end();
    const signature = sign.sign(sa.private_key);
    segments.push(base64url(signature));
    return segments.join(".");
}

function send(res, status, body) {
    res.writeHead(status, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end(JSON.stringify(body));
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let data = "";
        req.on("data", (chunk) => (data += chunk));
        req.on("end", () => {
            try {
                resolve(data ? JSON.parse(data) : {});
            } catch (e) {
                reject(e);
            }
        });
        req.on("error", reject);
    });
}

async function signInWithPassword(email, password) {
    const url =
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" +
        API_KEY;
    const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
        }),
    });
    const data = await r.json();
    if (!r.ok) {
        const err = new Error(data.error?.message || "Login failed");
        throw err;
    }
    return data;
}

const server = http.createServer(async (req, res) => {
    if (req.method === "OPTIONS") {
        res.writeHead(204, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        });
        res.end();
        return;
    }

    if (req.method === "GET" && req.url === "/health") {
        send(res, 200, { ok: true, hasServiceAccount: !!serviceAccount });
        return;
    }

    if (req.method === "POST" && req.url === "/login") {
        if (!serviceAccount) {
            send(res, 503, {
                error:
                    "Add firebase-service-account.json (Firebase → Service accounts → Generate key)",
            });
            return;
        }

        try {
            const body = await readBody(req);
            const email = (body.email || "").trim();
            const password = body.password || "";
            if (!email || !password) {
                send(res, 400, { error: "email and password required" });
                return;
            }

            const account = await signInWithPassword(email, password);
            const customToken = createCustomToken(account.localId, serviceAccount);
            send(res, 200, { customToken });
        } catch (err) {
            console.error("Login proxy:", err.message);
            send(res, 401, { error: err.message || "Login failed" });
        }
        return;
    }

    send(res, 404, { error: "not found" });
});

server.listen(PORT, "127.0.0.1", () => {
    console.log("SafeMe auth proxy: http://127.0.0.1:" + PORT);
});
