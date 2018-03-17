$(document).ready(function() {
  //////////////////////////////
  ////// GLOBAL VARIABLES //////
  //////////////////////////////

  // Cloudinary Variables
  var CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/spiffy-plus/upload";
  var CLOUDINARY_UPLOAD_PRESET = "prdda0cv";
  // Default image (i.e. for when user doesn't upload an image)
  var SPIFFY_LOGO_URL = "http://res.cloudinary.com/spiffy-plus/image/upload/v1521299063/spiffy-temp-logo.png";

  // Variables for uploading images from form
  // These have to be global since we're separating the Choose File button from the upload action
  var imageToUpload;
  var formData;

  ////////////////////////////
  ////// EVENT HANDLERS //////
  ////////////////////////////

  // When the user selects an image using the Choose File button (triggers a change)
  $("#userImg").on("change", function() {
    // Store the file object in imageToUpload
    imageToUpload = $(this)[0].files[0];

    // Construct FormData object
    formData = new FormData();
    formData.append("file", imageToUpload);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  });

  // When the user clicks the upload button
  $("#submit-new-issue").on("click", function(e) {
    // Prevent default
    e.preventDefault();

    // If no image is provided
    if (!imageToUpload) {
      // Call sendTweet with default image
      sendTweet(SPIFFY_LOGO_URL);
    } else {
      // Otherwise the user uploaded an image
      // Make an AJAX POST request to Cloudinary
      $.ajax({
        url: CLOUDINARY_URL,
        data: formData,
        type: "POST",
        contentType: false,
        processData: false

      }).then(function(cloudinaryRes) {
        // Call sendTweet function and pass image url
        sendTweet(cloudinaryRes.url);
      }).catch(function(cloudinaryErr) {
        // Error handling
        console.error(cloudinaryErr);
      });
    }
  });
});

// When user clicks upvote or downvote button
$(".vote-btn").on("click", function() {
  // Set type of vote
  var voteType;
  if($(this).hasClass("upvote-btn")) {
    voteType = "up";
  } else if ($(this).hasClass("downvote-btn")) {
    voteType = "down";
  }

  // Set API route based on ID
  var apiRoute = `/api/issues/${$(this).attr("data-id")}`;

  // AJAX request to get current score and perform appropriate PUT request based on voteType
  // i.e. either increment or decrement current score
  $.ajax(apiRoute, {
    type: "GET"
  }).then(function(res) {
    var newScore;
    // if voteType is up
    if (voteType === "up") {
      newScore = res.score + 1;
    } else if (voteType === "down") {
      newScore = res.score - 1;
    }
    // AJAX PUT request to update score
    $.ajax(apiRoute, {
      data: {
        score: newScore
      },
      type: "PUT"
    }).then(function(updateResponse) {
      // Set element with class issue-score and matching data-id to score from response
      $(`.issue-score[data-id="${updateResponse.id}"]`).text(updateResponse.score);
    });
  });
});


  function sendTweet(imageUrl) {
    // Set up Codebird
    var cb = new Codebird();

    cb.setConsumerKey("fBm9xMcWCrSIzi4sjqC9mCI9T", "awCSRWNXzqCl1Rz3k5fvZl5XyKOwAX4PE7tVthASHjGm52OqOg");
    cb.setToken("973723797613367298-sBw6uEPUauV5v2ceKQYlvuZofplRlYu", "knYbR6dulgqloyYCwxZtd6BeSuesb3DbgdsyPQwsKaKBu");
    // Grab pertinent information from form

    var tweetInfo = {
      title: $("#userProjectName").val().trim(),
      location: $("#user-location").val().trim(),
      type: $("#userProjectType").val().trim().toLowerCase(),
      username: $("#user-name").val().trim()
    };

    // Create message
    var params = {
      status: `We just received a new ${tweetInfo.type} request from ${tweetInfo.username}! Here's the info:\nTitle: ${tweetInfo.title}\nLocation: ${tweetInfo.location}\nImage: ${imageUrl}`
    };
    // Post message
    cb.__call("statuses_update", params, function(reply, rate, err) {
        // call postNewProject and pass imageUrl and tweetUrl as args
        postNewProject(imageUrl, reply.id_str);
      });
  }

  function postNewProject(imgUrl, twitterUrl){
    var newProject = {
      title: $("#userProjectName").val().trim(),
      location: $("#user-location").val().trim(),
      projectType:$("#userProjectType").val().trim(),
      imglocation: imgUrl,
      user: $("#user-name").val().trim(),
      tweetURL: twitterUrl,
      score: 0
    }

    console.log(newProject);
    $.ajax("/api/issues", {
      data: newProject,
      type: "POST"
    }).then(function() {
      console.log("new project added");

      // location.reload();
    })

  }

  /*Modal Open and Close*/
  /*Open modal*/
  $(document).on('click', '.issue', function() {
    $(this).next("div").show(200);
  });
  /*close modal*/
  $(document).on('click', '.close', function(){
    console.log("close button clicked");
    $('.modal').hide(200);
  })
