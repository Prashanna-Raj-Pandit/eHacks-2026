console.log("Running smoke test...");
if (1 + 1 !== 2) {
  throw new Error("Test failed");
}
console.log("Test passed");