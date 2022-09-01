
$("#search").on('change keyup paste', function () {
   
    
    let div = document.querySelector(".search-div");
    let bg = document.querySelector(".sec");
    let val = $('#search').val();
   
    if (val) {
        div.classList.add('search-div-active')
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        bg.classList.add('sec1')
    } else {
        div.classList.remove('search-div-active')
        bg.classList.remove('sec1')
    }
    
   

    
    $.ajax({
        url: "/search?val=" + val,
        method: 'get',
        success: (data) => {
            console.log(data);
            if (data != '') {
                document.getElementById('search-div').innerHTML = `${data.map((pro) => {
                    return `<div style="margin-top:6px;" class="col-md-3">
                <div id="card" class="card p-5em mt-7" style="width: 14rem;">
                <img class="card-img-top" src="/product-images/${pro._id}.jpg" alt="Card image cap">
                <div class="card-body">
                <h5 id="card-name" class="card-title">${pro.productname}</h5>
                <p id="card-text" class="card-text">${pro.description}</p>
                <p class="card-text">Rs.${pro.price}</p>
                <button class="btn btn-primary" onclick="addToCart('${pro._id}')">add to cart</button>
               
                </div>
                </div>
                </div>`
                
                })}`
            } else {
                document.getElementById('search-div').innerHTML= '<div class="nopro">No Product Found</div>'
            }
           
           

            
        }
    })  
});




function addToCart(proId){
    $.ajax({
        url:'/add-to-cart?id='+proId,
        method:'POST',
        success:(response)=>{
           
            if(response.status){
                let count=$('#cart-count').html()
                count=parseInt(count)+1         
                $('#cart-count').html(count)
                console.log('hi buddy');
            }
            else{
                console.log('hi buddy');
                document.getElementById('logwarn').innerHTML= ' <span class="alert alert-danger">Please login</span>'
            }
        }
    })

}
function changeQuantity(cartId,proId,count){

    let quantity=parseInt(document.getElementById('spn'+proId).innerHTML)

    $.ajax({
        url:'/cart-change-quantity',
        data:{
            cart:cartId,
            product:proId,
            count:count,
            quantity:quantity
        },
        method:'post',
        success:(response)=>{
            
            let subTotal = response.price*(quantity+count)
            console.log(subTotal);
            $('#subTotal').html(subTotal)
            if(response.deleteProduct){
                if(response.total){
                  
             $('#tr'+proId).remove()
             let msg='Product Removed'
             $('#delete-msg').html(msg)
             $('#total').html(response.total)
             
            }else{
                location.reload();
            }

        }else{
            
            let quantity=$('#spn'+proId).html()
             quantity=parseInt(quantity)+count
            $('#spn'+proId).html(quantity)
            $('#total').html(response.total)
            }
        
            
        }
        
    })

}
function productDelete(proId,cartId,prodName){

    swal({
        title: "Are you sure?",
        text: "remove "+prodName+" from cart",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((willDelete) => {
        if (willDelete) {
            $.ajax({
                url:'/delete-product',
                data:{
                   product:proId,
                   cart:cartId
               },
               method:'post',
               success:(response)=>{
                   $('#tr'+proId).remove()
                   let msg=prodName+' removed'
                   $('#delete-msg').html(msg)
                   
           
               }
           })
          swal(prodName+" has removed from cart", {
            icon: "success",
          });
        } else {
          swal("deletion aborted");
        }
      });

 
}
$('#checkout-form').submit((e)=>{
    e.preventDefault()
   
    console.log($('#checkout-form').serialize());
    try {
        let address = $('#checkout-form').serialize().split('&')[0]
        if (address!='Payment-method=COD' && address!='Payment-method=Online-Payment' && address!='Payment-method=paypal') {
            $.ajax({
                url:'/place-order',
                method:'post',
                data:$('#checkout-form').serialize(),
                  success:(response)=>{
                      if(response.codSuccess){
                        location.href='/orderPlaced'
                      }
                      else if(response.paymentErr){
                        alert("payment error")
                          
                      } else {
                        console.log(response);
                        razorPayment(response)
                      }
                    
            }
            })
        }
        else{
            swal("Please provide delivery informations");
        }
      

    } catch (error) {
        console.log("address error");
    }

 
})

function razorPayment(order) {
    
    var options = {
        "key": "rzp_test_9osRhNEeYctsvv", // Enter the Key ID generated from the Dashboard
        "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": order.user.name,
        "description": "Test Transaction",
        "image": "/images/resize-1661314920805561225Group1.jpg",
        "order_id":order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response){
            
            verifyPayment(response,order)
        },
        "prefill": {
            "name": order.user.name,
            "email": order.user.email,
            "contact": order.user.phone
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#F37254"
        }
    };

    var rzp1 = new Razorpay(options);
    rzp1.open();

}
function verifyPayment(payment,order){
   console.log("helo");
    $.ajax({
        url:'/verify-payment',
        data:{
        payment,
        order
    },
    method:'post',
    success:(response=>{
        console.log("hello",response);
        if(response.status){
            location.href='/orderPlaced'
        }else{
          alert('payment failed')
        }
      })
    })
}

function userDetails(userId,id){
    
    $.ajax({
        url:'/admin/user-details?id='+userId,
        
        method:'get',
        success:(response)=>{
            console.log(response);
            $('#name'+id).html(response.name)
            $('#email'+id).html(response.email)

        }
    })

}

function setStatus(id){
    let status=$('#status'+id).val()
   
    if (!status) {
        status = "Waiting for cancel approval"
        $('#status'+id).html(status)
    }
    $.ajax({
        url:'/admin/set-status',
        data:{
            status:status,
            orderId:id
        },
        method:'post',
        success:(response)=>{
           
        }
        
        
    })
}

function wishList(userId,proId){
    $.ajax({
        url:'/wish-list',
        data:{
            user:userId,
            proId:proId
        },
        method:'post',
        success:(response)=>{
            if (response.status){
                $('#like'+proId).hide()
                $('#like2'+proId).hide()
               

            }else{
                $('#like'+proId).show()
                $('#like2'+proId).show()
            }
                
        }


    })
}

function unWish(userId, proId) {
    let div = document.querySelector(".liked"+proId)
    div.classList.add("hide-like-btn")
    
    
    $.ajax({
        url: '/wish-list',
        data:{
            user:userId,
            proId:proId
        },
        method:'post',
        success: (response) => {
            console.log(response);
            if (!response.status) {
               
            }
            
        }
    })
   
}
// Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
//     return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
// });

function removeWish(proId){
    $.ajax({
        url:'/remove-wish?id='+proId,
        method:'get',
        success:(response)=>{
            
            location.reload();
        }
        
    })
}





