<!-- Marp settings -->
<!-- footer: Made with <3 by KF -->
<!-- $theme: gaia -->

# Facebook Pages Manager

---

## Assignment

Create an application for the management of a Facebook Page. This can be a Web app or a mobile app, you can choose.

The app must be able to create regular posts to a __*Facebook Page*__ as well as __*Unpublished Page Posts*__. The app will be able to list posts (both published and unpublished) from a page, and show the __*number of people*__ who have __*viewed*__ each post.

---

## Keywords

* **Facebook Page**

  * Pages are for businesses, brands and organizations to share their stories and connect with people.
  * People who like your Page and their friends can get updates in News Feed.

![](assets/facebook-page.png)

---

* **Unpublished Page Posts**

	* [An unpublished Page post](https://www.facebook.com/business/help/835452799843730) is a post that is not immediately published on the Page or the news feed.

  * Unpublished posts serving as scheduled or draft content delivered on a future publication date or through promotion within an ad set.

<div align="center"><img src ="assets/unpublished.png" width=560 /></div>

---

* **Insights**

  * [Insights](https://developers.facebook.com/docs/graph-api/reference/v2.8/insights) is a product available to all Pages and Apps on Facebook, and any domains claimed by a site developer using the Insights dashboard. This object represents a single Insights metric that is tied to another particular Graph API object (Page, Post, etc.).

![](assets/insights.png)

---

## Initial Choices

* The application will be an iOS app for iPhone.
* It will be created with [React Native](https://facebook.github.io/react-native) framework.


```
react-native init FBPages
cd FBPages
react-native run-ios
```

![](assets/react-native.png)

---

## [Facebook SDK for React Native](https://github.com/facebook/react-native-fbsdk)

* **Login** - People can sign in to your app with their Facebook login.
* **Share** - People on your app can share, send a message, or like content in your app.
* **Graph API** - Get data in and out of Facebook's social graph. Query data, post stories, upload photos and do other tasks.

---

[Installation Guide](https://tylermcginnis.com/installing-the-facebook-sdk-into-a-react-native-android-and-ios-app/)

```ruby
react-native install react-native-fbsdk
react-native link react-native-fbsdk
# More configurations to go...
```

![](assets/install-fbsdk.png)

---

## [Access Token](https://developers.facebook.com/docs/pages/access-tokens)

| Type | Description                                                                                                      |
|-------------------|------------------------------------------------------------------------------------------------------------------|
| User Access Token | Needed any time the app calls an API to read, modify or write a specific person's Facebook data on their behalf. |
| Page Access Token | Needed to read, write or modify the data belonging to a Facebook Page.                                           |

---

## [Permissions for Pages](https://developers.facebook.com/docs/pages/access-tokens#page-permissions) (read)


| Permission    | Abilities                                                                                                    |
|---------------|--------------------------------------------------------------------------------------------------------------|
| [pages_show_list](https://developers.facebook.com/docs/facebook-login/permissions/#reference-pages_show_list) | Provides the access to show the list of the Pages that you manage. |
| [read_insights](https://developers.facebook.com/docs/facebook-login/permissions/#reference-read_insights)  | Provides read-only access to the Insights data for Pages, Apps and web domains the person owns.        |

---

## [Permissions for Pages](https://developers.facebook.com/docs/pages/access-tokens#page-permissions) (write)


| Permission    | Abilities                                                                                                    |
|---------------|--------------------------------------------------------------------------------------------------------------|
| [manage_pages](https://developers.facebook.com/docs/facebook-login/permissions/#reference-manage_pages)  | Enables your app to retrieve Page Access Tokens for the Pages and Apps that the person administrates.        |
| [publish_pages](https://developers.facebook.com/docs/facebook-login/permissions/#reference-publish_pages) | Gives your app the ability to post, comment and like as any of the Pages managed by a person using your app. |

* Facebook does not allow you to request both read and write permissions at the same time.

---

# Let's start!!

---

## Tasks

1. Create a Facebook app
2. Sign in with Facebook login
3. Get permissions to manage Pages
4. Get Pages the person is an admin for
5. List posts (both published and unpublished) from a page
6. Post regular and unpublished posts as a Page
7. Get No. of people who have viewed each post

---

#### 1. Create a Facebook App

Access to the Graph API requires you create a Facebook app ID. The App ID is used when making API calls.

<div align="center"><img src ="assets/create-an-app.png" /></div>

---

#### 2. Sign in with Facebook login

```
<LoginButton
  readPermissions={['pages_show_list', 'read_insights']}
  onLoginFinished={(error, result) => { /* ... */ }
  onLogoutFinished={() => { /* ... */ }}
/>
```

<div align="center"><img src ="assets/login-button.png" /></div>

---

#### 3. Get permissions to manage Pages

##### Read permissions

<div align="center"><img src ="assets/read-permissions.png" width=600 /></div>

<!-- * Review - If your app requests this permission Facebook will have to review how your app uses it. You can grant this permission on behalf of people listed within the Roles section of your App's Dashboard without review by Facebook.

When submitting for review, please make sure your instructions are easily reproducible by our team. For example, if your Page Management Tool has its own authentication system, please ensure you provide a working login (such as a username/password) to allow our review team to use your tool and test this functionality. -->

---

##### Write permissions

```ruby
LoginManager.logInWithPublishPermissions(
  ['manage_pages', 'publish_pages']).then( /* ... */ );
```

<div align="center"><img src ="assets/write-permissions.png" width=600 /></div>

---

#### 4. Get Pages the person is an admin for

### Graph APIs

#### User Accounts [/me/accounts](https://developers.facebook.com/docs/graph-api/reference/user/accounts/)

Pages this person is an admin for.

  * id, category, cover, name, picture, access_token (**Page Access Token**)

```ruby
GET graph.facebook.com
  /me/accounts?
    fields=id,access_token,category,cover,name,picture
```

---

```ruby
{
  data: [{
    cover: {
      source: 'https://scontent.xx.fbcdn.net/v/t31.0-8/s720x720/14682104_1774867362772830_2210814752802480724_o.jpg?oh=7fe7398d8eb9885fc4754470ce98b30f&oe=58D9BA40',
      /* ... */
    },
    id: '935544009880691',
    picture: {
      data: {
        url: 'https://scontent.xx.fbcdn.net/v/t1.0-1/c15.0.50.50/p50x50/399548_10149999285987789_1102888142_n.png?oh=82d551fbd5c70ae9e2ad123aaebbc331&oe=58E6646A',
        /* ... */
      }
    },
    name: 'FB Pages',
    access_token: '{page-access-token}',
    category: 'App Page'
  }],
  paging: {
    cursors: {
      after: 'NjI1Nzc5MTk0MTAzODk2',
      before: 'MTQwMjk4NzEwOTk2MDg1OQZDZD'
    }
  }
}
```

---

#### 5. List posts (both published and unpublished) from a page


### Page [/{page-id}](https://developers.facebook.com/docs/graph-api/reference/v2.8/page)

* Feed of Posts [/{page-id}/feed](https://developers.facebook.com/docs/graph-api/reference/v2.8/page/feed) - The feed of posts and links published by this page, or by others on this page.

* Promotable Posts [/{page-id}/promotable_posts](https://developers.facebook.com/docs/graph-api/reference/v2.8/page/feed) - shows only the posts that can be boosted (includes unpublished and scheduled posts).

* Unpublished and Scheduled Posts
  * is_published: **false**

<!--
  Fields:

  * id, admin_creator, application, caption, comments, created_time, description, from, full_picture, likes, link, message, name, place, scheduled_publish_time, shares, source, to, type
-->

---

##### GET method

```ruby
# Feed of Posts
GET graph.facebook.com
  /{page-id}/feed
  fields=id,admin_creator,application,caption,comments.limit(1).summary(true),created_time,description,from,likes.limit(1).summary(true),link,message,name,full_picture,shares,source,to,type

# Unpublished and scheduled posts
GET graph.facebook.com
  /{page-id}/promotable_posts
  fields=id,admin_creator,application,caption,comments.limit(1).summary(true),created_time,description,from,likes.limit(1).summary(true),link,message,name,full_picture,shares,source,to,type,scheduled_publish_time
  is_published=false
```

---

```ruby
{
  data: [{
    from: { name: 'FB Pages', id: '935544009880691' },
    full_picture: 'https://scontent.xx.fbcdn.net/v/t1.0-9/15741163_938506589584433_7777929036229952932_n.jpg?oh=c3871671f95db8f52f55b227e776e220&oe=58EB3B6D',
    likes: {
      summary: { total_count: 0, can_like: true, has_liked: false },
      data: []
    },
    id: '935544009880691_938506589584433',
    comments: {
      summary: { order: 'chronological', total_count: 0, can_comment: true },
      data: []
    },
    link: 'https://www.facebook.com/935544009880691/photos/a.937605853007840.1073741825.935544009880691/938506589584433/?type=3',
    /* ... */
```

---

```ruby
    ...
    application: {
      link: 'https://www.facebook.com/games/?app_id=432744327115082',
      name: 'F B Pages - App Review',
      id: '432744327115082'
    },
    type: 'photo',
    created_time: '2016-12-30T14:50:49+0000',
    name: 'Timeline Photos'
  }],
  paging: {
    previous: 'https://graph.facebook.com/v2.8/935544009880691/feed?fields=id,admin_creator,application,caption,comments.limit%281%29.summary%28true%29,created_time,description,from,likes.limit%281%29.summary%28true%29,link,message,name,full_picture,place,shares,source,to,type,scheduled_publish_time&limit=10&format=json&since=1483109449&access_token={access-token}&__previous=1',
    next: 'https://graph.facebook.com/v2.8/935544009880691/feed?fields=id,admin_creator,application,caption,comments.limit%281%29.summary%28true%29,created_time,description,from,likes.limit%281%29.summary%28true%29,link,message,name,full_picture,place,shares,source,to,type,scheduled_publish_time&limit=10&format=json&access_token={access-token}&until=1483016303'
  }
}
```

---

### Limitations

You can only read a maximum of 100 feed posts with the limit field. If you try to read more than that you will get an error message to not exceed 100.

---

#### [Traversing Paged Results](https://developers.facebook.com/docs/graph-api/using-graph-api#paging)

* Cursor-based Pagination

```ruby
{
  data: [
    /* ... */
  ],
  paging: {
    cursors: {
      after: 'MTAxNTExOTQ1MjAwNzI5NDE=',
      before: 'NDMyNzQyODI3OTQw'
    },
    previous: 'https://graph.facebook.com/me/albums?limit=25&before=NDMyNzQyODI3OTQw&access_token=<access_token>',
    next: 'https://graph.facebook.com/me/albums?limit=25&after=MTAxNTExOTQ1MjAwNzI5NDE=&access_token=<access_token>'
  }
}
```

---

* Time-based Pagination

```ruby
{
  data: [
    /* ... */
  ],
  paging: {
    previous: 'https://graph.facebook.com/me/feed?limit=25&since=1364849754&access_token=<access_token>',
    next: 'https://graph.facebook.com/me/feed?limit=25&until=1364587774&access_token=<access_token>'
  }
}
```

* Offset-based Pagination - not recommended

---

#### 6. Post regular and unpublished posts as a Page

##### POST method

```ruby
# Publish a Published post
POST graph.facebook.com
  /{page-id}/feed
    message="This is the message"

# Publish an Unpublished post
POST graph.facebook.com
  /{page-id}/feed
    message="This is the message"
    published=false
```

```ruby
{
  id: '935544009880691_938597242908701'  # post-id
}
```

---

#### 7. Get the number of people who have viewed each post

## Insights

##### [/{object-id}/insights/{metric-name}/{period}](https://developers.facebook.com/docs/graph-api/reference/v2.8/insights)

* Post Impressions in lifetime
* object-id: page-id, domain-id, **post-id**
* metric-name:
	**post_impressions** vs **post_impressions_unique**
* period: **lifetime**

---


##### GET method

```ruby
# Get the number of people who have viewed each post
GET graph.facebook.com
  /{post-id}/insights/post_impressions_unique/lifetime
```

```ruby
{
  data: [{
    id: '1402987109960859_1777967639129469/insights/post_impressions_unique/lifetime',
    values: [{ value: 275 }]
  }],
  paging: {
    previous: 'https://graph.facebook.com/v2.8/1402987109960859_1777967639129469/insights/post_impressions_unique/lifetime?access_token=<access_token>&fields=values&format=json&include_headers=false&sdk=ios&since=1483255363&until=1483514563',
    next: 'https://graph.facebook.com/v2.8/1402987109960859_1777967639129469/insights/post_impressions_unique/lifetime?access_token=<access_token>&fields=values&format=json&include_headers=false&sdk=ios&since=1483773763&until=1484032963'
  }
}
```

---

### Improvements to the assignment?

1. Delete a post
2. Schedule a post
3. Post a Photo (published/unpublished/scheduled)
4. Show the number of likes, comments and shares
5. Organic, Paid and Total impressions

---

#### 1. Delete a post

##### DELETE method

```ruby
# Delete a post
DELETE graph.facebook.com
  /{post-id}
```

```
{
  success: true
}
```

---

#### 2. Schedule a post

```ruby
# Publish an Scheduled post
POST graph.facebook.com
  /{page-id}/feed
    message="This is the message"
    published=false
    scheduled_publish_time=UNIXtimestamp  # between 10 minutes and 6 months from the time of publish
```

---

#### 3. Post a Photo (published/unpublished/scheduled)

## Photo [/{page-id}/photo](https://developers.facebook.com/docs/graph-api/reference/photo/)

* URL or a file attachment
* Pick/Take a picture -> Resize -> Upload -> Post

```ruby
  # Publish a Published post
  POST graph.facebook.com
    /{page-id}/photo
      url=https://this.is/photo.png
      caption="This is the message"  # instead of message
```

---

#### 3. Post a Photo


```ruby
  # Publish an Unpublished post
  POST graph.facebook.com
    /{page-id}/photo
      url=https://this.is/photo.png
      caption="This is the message"
      published=false

  # Publish a Scheduled post
  POST graph.facebook.com
    /{page-id}/photo
      url=https://this.is/photo.png
      caption="This is the message"
      published=false
      scheduled_publish_time=UNIXtimestamp  # between 10 minutes and 6 months from the time of publish
```

```
{
  id: '935544009880691_938597242908701'
}
```

---

#### 4. Show the number of likes, comments and shares

### /{page-id}/feed

Fields:
* likes.limit(1).summary(true)
* comments.limit(1).summary(true)
* shares

---

```ruby
{
  ...
  likes: {
    summary: { total_count: 15, can_like: true, has_liked: false },
    data: [{ id: '10154513917892659', name: 'Tony Wong' }],
  },
  comments: {
    summary: { order: 'chronological', total_count: 1, can_comment: true },
    data: [{
      message: 'Hello~',
      id: '1612015225724712_1612028642390037',
      created_time: '2015-08-02T03:14:47+0000',
      from: { name: 'Suet Fun Chan', id: '10209499501699446' }
    }],
  }
  shares: { count: 4 },
  ...
}
```

---

#### 5. Organic, Paid and Total impressions

##### post_impressions_by_paid_non_paid_unique

* The number of people who saw your Page post, broken down by total, paid, and non-paid

```
{
  data: [{
    id: '1402987109960859_1817144961878403/insights/post_impressions_by_paid_non_paid/lifetime',
    values: [{
      value: {
        total: 275,
        unpaid: 275,
        paid: 0
      }
    }]
  }],
  paging: {
    previous: 'https://graph.facebook.com/v2.8/1402987109960859_1817144961878403/insights/post_impressions_by_paid_non_paid/lifetime?access_token={page-access-token}&fields=values&format=json&include_headers=false&sdk=ios&since=1483432716&until=1483691916',
    next: 'https://graph.facebook.com/v2.8/1402987109960859_1817144961878403/insights/post_impressions_by_paid_non_paid/lifetime?access_token={page-access-token}&fields=values&format=json&include_headers=false&sdk=ios&since=1483951116&until=1484210316'
  }
}
```
---

## Good tools

* Graph API Explorer
  * You can quickly test this API using the Graph API Explorer in our Tools & Support section.

![](assets/graph-api-explorer.png)

---

## Good tools

* Documentation

![](assets/documentation.png)

---

## Dependencies

Several libraries listed in package.json.
The core of the application:

* [react](https://github.com/facebook/react) - A declarative, efficient, and flexible JavaScript library for building user interfaces.
* [react-native](https://github.com/facebook/react-native) -A framework for building native apps with React.
* [react-native-fbsdk](https://github.com/facebook/react-native-fbsdk) - A React Native wrapper around the Facebook SDKs for Android and iOS. Provides access to Facebook login, sharing, graph requests, app events etc.

---

Libraries for image upload:

* [react-native-aws3](https://github.com/benjreinhart/react-native-aws3) - Pure JavaScript React Native library for uploading to AWS S3.
* [react-native-image-picker](https://github.com/marcshilling/react-native-image-picker) - A React Native module that allows you to use native UI to select media from the device library or directly from the camera.
* [react-native-image-resizer](https://github.com/bamlab/react-native-image-resizer) - Resize local images with React Native.

---

A few convenience React libraries:

* [react-native-elements](https://github.com/react-native-community/react-native-elements) - React Native Elements UI Toolkit.
* [react-native-keyboard-spacer](https://github.com/Andr3wHur5t/react-native-keyboard-spacer) - Plug and play react-native keyboard spacer view.
* [react-native-navbar](https://github.com/Kureev/react-native-navbar) - Navbar component for React Native.
* [react-native-parsed-text](https://github.com/taskrabbit/react-native-parsed-text) - Parse text and make them into multiple React Native Text elements.

---

A few convenience React libraries:

* [react-native-radio-buttons](https://github.com/ArnaudRinquin/react-native-radio-buttons) - A Radio-button like logic wrapper for React Native.
* [react-native-root-toast](https://github.com/magicismight/react-native-root-toast) - React native toast like component, pure javascript solution.
* [react-native-router-flux](https://github.com/aksonov/react-native-router-flux) - React Native Router based on new React Native Navigation API (0.26)
* [react-native-vector-icons](https://github.com/oblador/react-native-vector-icons) - 3000 Customizable Icons for React Native with support for NavBar/TabBar/ToolbarAndroid, image source and full styling.

---

And classic Javascript libraries:

* [eslint](https://github.com/eslint/eslint) - A fully pluggable tool for identifying and reporting on patterns in JavaScript.
* [moment](https://github.com/moment/moment) - Parse, validate, manipulate, and display dates in javascript.

---
<!--
## Running

#### Start

* `react-native init FBPages`

#### Clone & install

* Clone this repo `git clone git@github.com:7kfpun/FBPages.git`
* `cd FBPages`
* run `yarn install` or `npm install`

---

#### iOS

* Run `react-native run-ios`
---
-->

# Thanks!
