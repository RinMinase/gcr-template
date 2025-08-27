async function multi1() {
  return new Promise((resolve) => {
    resolve("multi1");
  });
}

function multi2() {
  return "multi2";
}

module.exports = {
  multi1,
  multi2,
};
