import { PAGE_LISTING_TYPE } from "../../../on_behalf_of/types";
import { LISTING_UPDATED } from "../../types";
import isEmpty from 'lodash/isEmpty';
import { types as sdkTypes } from "../../../sharetribe";

const { UUID } = sdkTypes;

const checkCloseOpenDeleteAction = event => {
  const {
    attributes: {
      previousValues,
      eventType,
    }
  } = event;

  if (eventType !== LISTING_UPDATED ||
    !previousValues.attributes ||
    !previousValues.attributes.state
  ) {
    return false;
  }

  return true;
}

const processPortData = async (events) => {
  const dataByAuthor = events.reduce((result, event) => {
    const {
      attributes: {
        resourceId: {
          uuid
        },
        auditData: {
          adminId,
        },
        resource
      }
    } = event;

    const isCloseOpenDeleteAction = checkCloseOpenDeleteAction(event);

    if (!isCloseOpenDeleteAction) {
      return result;
    }

    const isPortListing = resource.attributes.publicData.listingType === PAGE_LISTING_TYPE;

    if (!isPortListing) {
      return result;
    }

    const authorId = resource.relationships.author.data.id.uuid;

    if (result[authorId]) {
      if (adminId) {
        result[authorId].eventByListing[uuid] = event;
      } else if (result[authorId].eventByListing[uuid]) {
        delete result[authorId].eventByListing[uuid];
      }
    } else if (adminId) {
      result[authorId] = {
        eventByListing: {}
      };
      result[authorId].eventByListing[uuid] = event;
      result.authorIds.push(authorId)
    }

    return result;
  }, {
    authorIds: []
  });
  const filteredDataByAuthor = dataByAuthor.authorIds
    .reduce((result, authorId) => {
      const companyData = dataByAuthor[authorId];
      if (isEmpty(companyData.eventByListing)) {
        return result;
      }
      result.push({
        id: new UUID(authorId),
        attributes: companyData
      });
      return result;
    }, []);

  return filteredDataByAuthor;
}

export default processPortData;