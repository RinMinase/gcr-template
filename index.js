const functions = require("@google-cloud/functions-framework");

const test = require("./src/single-function.js");
const multi = require("./src/multi-function.js");

functions.http("index", async (req, res) => {
  // GET requirement
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const single = test();
  const multivalue1 = await multi.multi1();
  const multivalue2 = multi.multi2();

  res.json({
    status: "Success",
    single,
    multivalue1,
    multivalue2,
  });
});
