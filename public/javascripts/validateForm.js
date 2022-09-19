$(document).ready(function () {
  jQuery.validator.addMethod(
    "lettersonly",
    function (value, element) {
      return this.optional(element) || /^[a-z,A-Z ]+$/.test(value);
    },
    "Letters only please"
  );
  jQuery.validator.addMethod(
    "minlength5",
    function (value, element) {
      return this.optional(element) || (value.trim().length >= 5);
    },
    "Minimum 5 characters without space"
  );
  $(".SUF").validate({
    rules: {
      name: {
        lettersonly: true,
        required: true,
      },
      email: {
        required: true,
        email: true,
      },
      phone: {
        required: true,
        number: true,
        minlength: 10,
        maxlength: 10,
      },
      password: {
        required: true,
        minlength: 5,
        maxlength: 15,
      },
      confirmPassword: {
        equalTo: "#password",
        minlength5: true,
        required: true,
        minlength: 5,
        maxlength: 15,
      },  
       newPassword: {
        required: true,
        minlength: 5,
        maxlength: 15,
      },
      confirmPassword2: {
        equalTo: "#password2",
        minlength5: true,
        required: true,
        minlength: 5,
        maxlength: 15,
      },  
    },
    messages: {
      name: {
        minlength: "Please Enter Your Full Name",
      },
      email: {
        email: "Please enter a valid Email id",
      },
      password: {
        minlength: "Please enter a password more than 5 characters",
        maxlength: "Please enter a password less than 15 characters",
      },
      phone: "Enter valid phone number ",
      confirmPassword: "Enter same password again",
    },
  });
  $(".LIF").validate({
    rules: {

      email: {
        required: true,
        email: true,
      },
      phone: {
        required: true,
        number: true,
        minlength: 10,
        maxlength: 10,
      },
      password: {
        required: true,
        minlength: 5,
        maxlength: 15,
      },
    },
    messages: {

      email: {
        email: "Please enter a valid Email id",
      },
      password: {
        minlength: "Please enter a password more than 5 characters",
        maxlength: "Please enter a password less than 15 characters",
      },
      phone: "Invalid phone number",

    },
  });
});
$(".UF").validate({
  rules: {
    name: {
      lettersonly: true,
      required: true,
    },
    email: {
      required: true,
      email: true,
    },
    phone: {
      required: true,
      number: true,
      minlength: 10,
      maxlength: 10,
    },
    password: {
      required: true,
      minlength: 5,
      maxlength: 15,
    },
    confirmPassword: {
      equalTo: "#password",
      minlength5: true,
      required: true,
      minlength: 5,
      maxlength: 15,
    },
  },
  messages: {
    name: {
      minlength: "Please Enter Your Full Name",
    },
    email: {
      email: "Please enter a valid Email id",
    },
    password: {
      minlength: "Please enter a password more than 5 characters",
      maxlength: "Please enter a password less than 15 characters",
    },
    phone: "Enter valid phone number ",
    confirmPassword: "Enter same password again",
  },
});
$(".UFA").validate({
  rules: {

    address: {
      required: true,
      minlength: 10
    },
    pin: {
      required: true,
      number: true,
      minlength: 6,
      maxlength: 6,
    }
  },
  messages: {

    address: {
      minlength: "Please enter a valid address",
    },
    pin: {
      minlength: "Please enter 6 digit pin code",
    },

  },
});
$("#addProduct").validate({
  rules: {

    productname: {
      required: true,
      minlength5: true,
    },
    description: {
      required: true,
      minlength5: true,
    },
    price: {
      required: true,
      number: true,
    }
  },
  messages: {

    productname: {
      minlength: "Please enter at least 4 characters",
    },
    description: {
      minlength: "Please enter at least 6 characters",
    },
    price: {
      required: "hey do you forget me",
    },


  },
});
$("#editProduct").validate({
  rules: {

    productname: {
      required: true,
      minlength5: true,
    },
    description: {
      required: true,
      minlength5: true,
    },
    price: {
      required: true,
      number: true,
    }
  },
  messages: {

    productname: {
      minlength: "Please enter at least 4 characters",
    },
    description: {
      minlength: "Please enter at least 6 characters",
    },
    price: {
      required: "hey do you forget me",
    },


  },
});
