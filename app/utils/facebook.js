import { GraphRequest, GraphRequestManager } from 'react-native-fbsdk';

function graphRequest(path, parameters, accessToken, callback) {
  const fields = { parameters };
  if (accessToken) {
    fields.accessToken = accessToken;
  }
  const infoRequest = new GraphRequest(
    path,
    fields,
    (error, result) => callback(error, result),
  );

  new GraphRequestManager().addRequest(infoRequest).start();
}

export const accounts = callback => graphRequest('/me/accounts', { fields: { string: 'id,name,category,picture,access_token,cover' }, limit: { string: '100' } }, null, callback);

export const FEED_PUBLISHED = 'published';
export const FEED_UNPUBLISHED = 'unpublished';
export const FEED_ALL = 'all';

export const feed = (pageId, postsToShow = FEED_PUBLISHED, limit = 100, pageAccessToken, callback) => {
  let path = `/${pageId}`;
  const parameters = {
    fields: { string: 'id,admin_creator,application,caption,created_time,description,from,icon,is_hidden,link,message,message_tags,name,object_id,full_picture,place,properties,shares,source,to,type,scheduled_publish_time' },
    limit: { string: limit.toString() },
  };
  if (postsToShow === FEED_PUBLISHED) {
    path += '/feed';
  } else {
    path += '/promotable_posts';
    if (postsToShow !== FEED_ALL) {
      parameters.is_published = { string: 'false' };
    }
  }

  graphRequest(
    path,
    parameters,
    pageAccessToken,
    callback,
  );
};

export const POST_PUBLISHED = 'published';
export const POST_UNPUBLISHED = 'unpublished';
export const POST_SCHEDULE = 'schedule';

export const publish = (pageId, publishedOrUnpublished, text, scheduledPublishTime, pageAccessToken, callback) => {
  const parameters = {
    message: { string: text },
  };

  if (publishedOrUnpublished !== POST_PUBLISHED) {
    parameters.published = { string: 'false' };
  }

  if (publishedOrUnpublished === POST_SCHEDULE) {
    parameters.scheduled_publish_time = { string: Math.round(scheduledPublishTime.getTime() / 1000).toString() };
  }

  const infoRequest = new GraphRequest(
    `/${pageId}/feed`,
    {
      parameters,
      httpMethod: 'POST',
      accessToken: pageAccessToken,
    },
    (error, result) => callback(error, result),
  );

  new GraphRequestManager().addRequest(infoRequest).start();
};

export const insights = (postId, pageAccessToken, callback) => {
  graphRequest(
    `/${postId}/insights/post_impressions_unique/lifetime`,
    { fields: { string: 'values' } },
    pageAccessToken,
    callback,
  );
};
