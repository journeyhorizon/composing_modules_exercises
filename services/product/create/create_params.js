const createProductParams = async (listing) => {
  //TODO: Add more needed attributes to this place
  return {
    id: listing.id.uuid,
    name: listing.attributes.title,
  }      
}

export default createProductParams; 