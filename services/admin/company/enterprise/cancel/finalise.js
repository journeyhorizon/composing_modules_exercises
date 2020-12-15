const finalise = async (res) => {
  return {
    code: 200,
    data: {
      data: [res],
    }
  }
}

export default finalise;