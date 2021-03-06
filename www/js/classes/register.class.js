class Register extends Base {
  constructor(app, clickedBtn, movieInstance) {
    super();
    this.app = app;
    this.checkClickCreateUser();
    this.clickedBtn = clickedBtn;
    this.movieInstance = movieInstance;
    this.load();
  }

  //loads in the users.json file so we can save data to it
  async load() {
    this.users = await JSON._load('users.json');
  }

  drawRegisterModal() {
    $('main #register-modal').remove();
    $('main').append(this.template());
    $('#register-modal').modal();
  }

  checkClickCreateUser() {
    let that = this;
    //function so pressing enter works to register a new account

    $(document).on('submit', '#registerForm', function(e) {
      e.preventDefault();
      that.createUser();
    });
  }

  async createUser() {
    //makes it possible to take the values from the input fields and adds a random member number
    let username = $('#name').val();
    let password = $('#password').val();
    let personName = $('#namnRegister').val();
    let memberNumber;
    let newUser;
    let currentSession = await JSON._load('session');
    giveMemberNr();

    async function giveMemberNr() {
      memberNumber = Math.floor((Math.random() * 10000000) + 1);
      let users = await JSON._load('users');
      //If the random number that being generated is already in use,
      //then generate a new. OBS! The odds are very small of two identical numbers.
      for (let obj of users) {
        if (obj.memberNumber == memberNumber) {
          giveMemberNr();
          break;
        }
      }
    }

    //fixes for password validation so they have to be the same.
    if (username.length > 2 && password.length > 5) {
      if ($('#password-confirm').val() !== password) {
        $('#errorMessagePWConfirm').removeClass('d-none');
        setTimeout(() => {$('#errorMessagePWConfirm').addClass('d-none');}, 2000);
      } else if (this.checkDuplicate(username)) {
        $('#userNameTaken').removeClass('d-none');
        setTimeout(() => {$('#userNameTaken').addClass('d-none');}, 2000);
      } else {
        newUser = {
          username: username,
          password: password,
          memberNumber: memberNumber,
          personName: personName
        };
        this.users.push(newUser);
        JSON._save('users.json', this.users);
        $('#regSuccess').removeClass('d-none');
        setTimeout(() => {
          $('#register-modal').modal('hide');
          const regex = /(\/film\/)/g;
          if(regex.test(location.pathname)){
            this.movieInstance.openBookingModal(this.clickedBtn);
          }
        }, 3000);
        currentSession = newUser.memberNumber;
        JSON._save('session', currentSession);
        this.app.popState.renderCorrectNav();
        // //Reload login to make it possible to login after registration
        // this.app.navbar.login.load();
      }
    } else {
      $('#checkInput').removeClass('d-none');
      setTimeout(() => {$('#checkInput').addClass('d-none');}, 3000);
    }
  }
  checkDuplicate(username) {
    let users = this.users;
    for (let obj of users) {
      if (obj.username == username) {
        return true;
      }
    }
  }
}
