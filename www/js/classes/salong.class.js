class Salong extends Base {
	constructor(auditorium, dateTime, title){
		super();
		this.app = app;
    this.seatHtml = [];
    this.auditorium = auditorium;
    this.dateTime = dateTime;
    this.title = title;
    this.selectedSeats = [];
    this.quantity = 0;
    this.co = 0;
    this.load().then(() => {
      this.salongSize = this.getSalongSize(auditorium);
      this.createSalong(this.salongSize);
      this.render('#salong');
      this.getBookedSeats(this.auditorium, this.dateTime, this.title);
      this.scaleSalong();
      $(window).resize(this.scaleSalong);
    });
  }

  async load(){
    this.salonger = await JSON._load('salonger.json');
    this.orders = await JSON._load('orders.json');
  }

  getBookedSeats(auditorium, dateTime, title) {
    let bookedSeats = [];
    this.orders.forEach(order => {
      if (order.orderInfo.salong === auditorium && order.orderInfo.date === dateTime && order.orderInfo.title === title) {
        order.orderInfo.seats.forEach(seat => {
          seat.seatNumbers.forEach(number => {
            bookedSeats.push(number);
          })
        })
      }
    })

    bookedSeats.forEach(seatId => {
      $(`#${seatId}`).addClass(`occupied`);
    })
    return bookedSeats;
  }

  getSalongSize(auditorium) {
    let salongSize = {};
    this.salonger.some(salong => {
      if (salong.name === auditorium){
        salongSize = salong.seatsPerRow;
        return true;
      }
    })
    return salongSize;
  }

  getMaxSeatNumber(row) {
    if (this.auditorium === "Lilla Salongen") {
      switch(row) {
        case 1: return 6;
        case 2: return 14;
        case 3: return 23;
        case 4: return 33;
        case 5: return 43;
        case 6: return 55;
      }
    } else {
      switch(row) {
        case 1: return 8;
        case 2: return 17;
        case 3: return 27;
        case 4: return 37;
        case 5: return 47;
        case 6: return 57;
        case 7: return 69;
        case 8: return 81;
      }
    }
  }

	createSalong(salongObject) {
    // create all seats of the salong
    for (let row in salongObject) {
      // salongObject[row] is number of seats in one row
      this.seat = new Array(salongObject[row]);
      const y = 20 + 50 * row;
      // calculate distance from left side (800 is size of svg width)
      const distanceFromLeft = (800 - (salongObject[row] * 40 + 5 * (salongObject[row] - 1))) / 2;
      const maxSeatNumber = this.getMaxSeatNumber(parseInt(row));
      // create seats in one row
      for (let i = 0, x = distanceFromLeft, seatNumber = maxSeatNumber;
          i < salongObject[row];
          i++, seatNumber--) {
        this.seat[i] = new Seat(x, y, seatNumber);
        this.seatHtml.push(this.seat[i].htmlTemplate);
        x += 45;
      }
    }
  }

  template() {
  const salong = `
    <svg width="800" height="550">
      ${this.seatHtml.join("")}
    </svg>
  `
  return salong;
  }

  getRow(seatNumber) {
    if (this.auditorium === "Lilla Salongen") {
      if (seatNumber > 0 && seatNumber <= 6){ return 1; }
      if (seatNumber > 6 && seatNumber <= 14){ return 2; }
      if (seatNumber > 14 && seatNumber <= 23){ return 3; }
      if (seatNumber > 23 && seatNumber <= 33){ return 4; }
      if (seatNumber > 33 && seatNumber <= 43){ return 5; }
      if (seatNumber > 43 && seatNumber <= 55){ return 6; }
    } else {
      if (seatNumber > 0 && seatNumber <= 8){ return 1; }
      if (seatNumber > 8 && seatNumber <= 17){ return 2; }
      if (seatNumber > 17 && seatNumber <= 27){ return 3; }
      if (seatNumber > 27 && seatNumber <= 37){ return 4; }
      if (seatNumber > 37 && seatNumber <= 47){ return 5; }
      if (seatNumber > 47 && seatNumber <= 57){ return 6; }
      if (seatNumber > 57 && seatNumber <= 69){ return 7; }
      if (seatNumber > 69 && seatNumber <= 81){ return 8; }
    }
  }

  scaleSalong() {
    let orgW = 800,
        orgH = 550;
    let w = $(window).width();
    let h = $(window).height();
    w -= 20 * 2;
    h -= 20 * 2;
    const wScale = w / orgW;
    const hScale = h / orgH;
    let scaling = Math.min(wScale, hScale);
    scaling > 1 && (scaling = 1);
    $('#salong').css('transform', `scale(${scaling})`);
    $('#salong-holder').width(orgW * scaling);
    $('#salong-holder').height(orgH * scaling);
  }

  getSeatsPerRow(row) {
    if (this.auditorium == 'Lilla Salongen') {
      return this.salonger[1].seatsPerRow[row];
    } else {
      return this.salonger[0].seatsPerRow[row];
    }
  }

  getSiblingsTargetIds(baseTargetId) {
    const targetIds = []
    const row = this.getRow(baseTargetId);
    const maxSeatNumber = this.getMaxSeatNumber(row);
    const seatsPerRow = this.getSeatsPerRow(row);
    let remainedSeatNumber = this.quantity - this.co - 1; // - 1 because baseTargetId already is selected

    for (let i = baseTargetId + 1; i <= maxSeatNumber; i++) {
      if (remainedSeatNumber <= 0) { break; }
      if ($('.occupied#'+i).length == 0) {
        targetIds.push(i);
        remainedSeatNumber--;
      } else { break; }
    }

    for (let i = baseTargetId - 1; i > maxSeatNumber - seatsPerRow; i--) {
      if (remainedSeatNumber <= 0) { break; }
      if ($('.occupied#'+i).length == 0) {
        targetIds.push(i);
        remainedSeatNumber--;
      } else { break; }
    }

    return targetIds;
  }

  getMouseoverOrOutTargets(baseTarget) {
    const targets = [baseTarget];
    const baseTargetId = parseInt(baseTarget.attr("id"));
    const targetSiblingsIds = this.getSiblingsTargetIds(baseTargetId);

    targetSiblingsIds.forEach(siblingsId => {
      targets.push(baseTarget.siblings(`#${siblingsId}`));
    })
    return targets;
  }

  mouseover(event) {
    const target = $(event.target);

    if (target.is('rect') && target.hasClass('vacant') && !(target.hasClass('occupied'))) {
      const targets = this.getMouseoverOrOutTargets(target);
      let canBook = true;

      targets.forEach(element => {
        if (element.hasClass('occupied')){
          canBook = false;
        }
      })

      if (canBook) {
        targets.forEach(element => {
          element.removeClass('vacant');
          element.addClass('mouseentered');
        });
      }

    }
  }

  mouseout(event) {
    const target = $(event.target);
    if (target.is('rect')) {
      $('rect').removeClass('mouseentered');
      $('rect').addClass('vacant');
    }
  }

  getSeatIndex(row) {
    // return an index in the array if an element passes the test; otherwise, -1
    return this.selectedSeats.findIndex(seat => {
      return seat.row === row;
    })
  }

  addSeat({row, seatNumber, target}) {
    target.addClass('selected');
    const index = this.getSeatIndex(row);
    if (index === -1){
      this.selectedSeats.push({row, seatNumbers: [seatNumber]});
    } else {
      this.selectedSeats[index].seatNumbers.push(seatNumber);
    }
    this.co++;
  }

  removeSeat({row, seatNumber, target}) {
    const index = this.getSeatIndex(row);
    if (index === -1) return;

    target.removeClass('selected');
    if (this.selectedSeats[index].seatNumbers.length === 1) {
      this.selectedSeats.splice(index, 1);
    } else {
      this.selectedSeats[index].seatNumbers.some((seat, i) => {
        if (seat === seatNumber) {
          this.selectedSeats[index].seatNumbers.splice(i, 1);
          return true;
        }
      })
    }
    this.co--;
  }

  removeAllSeat() {
    this.co = 0;
    this.selectedSeats.length = 0;
    this.quantity = 0;
    $('rect').removeClass('selected');
  }

  click(event) {
    if ($(event.target).hasClass('selected')) {
      const seatNumber = parseInt($(event.target).attr("id"));
      let row = this.getRow(seatNumber);
      this.removeSeat({row, seatNumber, target: $(event.target)});
      return;
    } else if (this.quantity - this.co == 0 && !$(event.target).hasClass('occupied')) {
      this.co = 0;
      this.selectedSeats.length = 0;
      $('rect').removeClass('selected');
    }

    const seatTargets = this.getMouseoverOrOutTargets($(event.target));

    if (!($(event.target).hasClass('selected')) && !($(event.target).hasClass('occupied')) && $(event.target).is('rect')) {
      if (this.co === this.quantity) return;

      seatTargets.forEach(seatTarget => {
        const seatNumber = parseInt(seatTarget.attr("id"));
        let row = this.getRow(seatNumber);
        this.addSeat({row, seatNumber, target: seatTarget});
      })
    }

    $('.info-tickets').empty();
    this.selectedSeats.sort((a, b) => { return a.row - b.row });

    this.selectedSeats.forEach(seat => {
      seat.seatNumbers.sort((a, b) => { return a - b });
      $('.info-tickets').append(`<p><small>Rad: ${seat.row}, plats: ${seat.seatNumbers.join(', ')}</small></p>`);
    })
  }

}