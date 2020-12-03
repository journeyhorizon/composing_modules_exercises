const finalise = async (res) => {
  return {
    code: 200,
    data: res.data
  };
}

export default finalise;