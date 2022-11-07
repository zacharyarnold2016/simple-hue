import superagent from "superagent";
import dotenv from "dotenv";
import { appendFile } from "fs";

dotenv.config();

// These lines exist for development. must remove when finished.
const ip = process.env.IP || "192.168.1.158";
const username =
  process.env.USERNAME || "QawikQjBYz-9w-jz6LBBqbNtC7TwsagC2FczAheZ";

/**
 *  DO. NOT. ABUSE. THIS. FUNCTION.
 *
 *  Hue has a request limit for the amount of times your code can hit this url. I believe
 *  it's somewhere around 15 attempts. During coding i'd recommend using this once, storing it temporarily,
 *  and then testing this every once in a while.
 *
 *  This Function grabs the ip address assigned to your phillips hue bridge. operates under the assumption
 *  that users will only have 1 bridge.
 *
 * @returns internalipaddress: Value retrieved from Phillips Bridge IP Discovery Tool
 */
const getIP = async () => {
  try {
    const { _body } = await superagent.get("https://discovery.meethue.com");
    const body = _body[0];
    const { internalipaddress } = body;
    return internalipaddress;
  } catch (err) {
    throw err;
  }
};

/**
 * Initializes and authenticates an app connection for the user.
 *
 * @param {String} name: desired app name
 * @param {String} ip: ip address for Hue Bridge
 *
 * @returns object: Values derived from the user creation process. IP and User
 */
const synchronizeApp = async (name, ip) => {
  try {
    const { _body } = await superagent.post(`https://${ip}/api`).send({
      devicetype: name,
    });

    const {
      success: { username },
    } = _body[0];

    return {
      ip,
      username,
    };
  } catch (err) {
    throw err;
  }
};

/**
 * Used to store these Credentials in .env file. Might consolidate this process to
 * synchronizeApp function. Alternatively May add a returning option as as well as
 * seperate option.
 */
const storeCredentials = async ({ ip, username }) => {
  try {
    appendFile(".env", `\nIP=${ip} \nUSERNAME=${username}`, (err) => {
      console.log(err);
    });
  } catch (err) {
    throw err;
  }
};

/**
 * This is a oneshot of all of this code to get a quick start on the sync process.
 */
const init = async (name) => {
  try {
    dotenv.config();
    let ip = process.env.IP;

    if (!ip) ip = await getIP();

    const credentials = await synchronizeApp();
    await storeCredentials(credentials).then(() => {
      console.log(
        "Initialization Process Complete, check .env file for credentials"
      );
    });
  } catch (err) {
    throw err;
  }
};

export { getIP, synchronizeApp, storeCredentials, init };
