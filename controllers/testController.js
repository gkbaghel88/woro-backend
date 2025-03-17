
const testController = async (req, res) => {
  try {
    res.send("WORO Working Fine");
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};



module.exports = { testController };
