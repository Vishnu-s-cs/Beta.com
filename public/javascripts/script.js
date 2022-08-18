
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
                <p id="card-text" class="card-text">${pro.discription}</p>
                <p class="card-text">Rs.${pro.prize}</p>
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
        method:'get',
        success:(responce)=>{
            if(responce.status){
                let count=$('#cart-count').html()
                count=parseInt(count)+1         
                $('#cart-count').html(count)
            }
        }
    })

}
function changeQuandity(cartId,proId,count){
    let quandity=parseInt(document.getElementById('spn'+proId).innerHTML)

    $.ajax({
        url:'/cart-change-quandity',
        data:{
            cart:cartId,
            product:proId,
            count:count,
            quandity:quandity
        },
        method:'post',
        success:(responce)=>{
        
            if(responce.deleteProduct){
                if(responce.total){

             $('#tr'+proId).remove()
             let msg='Product Removed'
             $('#delete-msg').html(msg)
             $('#total').html(responce.total)
            }else{
                location.reload();
            }

        }else{
            
            let quandity=$('#spn'+proId).html()
             quandity=parseInt(quandity)+count
            $('#spn'+proId).html(quandity)
            $('#total').html(responce.total)
            }
        
            
        }
        
    })

}
function productDelete(proId,cartId,prodName){
   var check=  confirm("remove "+prodName+" form cart")
   if(check){
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
   }
}
$('#checkout-form').submit((e)=>{
    e.preventDefault()
    $.ajax({
        url:'/place-order',
        method:'post',
        data:$('#checkout-form').serialize(),
          success:(responce)=>{
              if(responce.codSuccess){
                location.href='/orderPlaced'
              }
              else if(responce.paymentErr){
                alert("payment error")
                  
              } else {
                razorPayment(responce)
              }
            
    }
    })
})

function razorPayment(order) {
    
    var options = {
        "key": "rzp_test_74IUoLSXBjLRXM", // Enter the Key ID generated from the Dashboard
        "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "ckvaizz",
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id":order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response){
            
            verifyPayment(response,order)
        },
        "prefill": {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "9999999999"
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
    $.ajax({
        url:'/verify-payment',
        data:{
        payment,
        order
    },
    method:'post',
    success:(responce)=>{
        if(responce.status){
            location.href='/orderPlaced'
        }else{
            alert(responce.errmsg)
        }

    }
    })
}

function userDetails(userId,id){
    
    $.ajax({
        url:'/admin/user-details?id='+userId,
        
        method:'get',
        success:(response)=>{
            console.log(response);
            $('#name'+id).html(response.Name)
            $('#email'+id).html(response.Email)

        }
    })

}

function setStatus(id){
    let status=$('#status'+id).val()
    
    
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
        success:(responce)=>{
            if (responce.status){
                $('#like'+proId).hide()

               

            }else{
                $('#like'+proId).show()

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
        success: (responce) => {
            console.log(responce);
            if (!responce.status) {
               
            }
            
        }
    })
   
}
Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

function removeWish(proId){
    $.ajax({
        url:'/remove-wish?id='+proId,
        method:'get',
        success:(response)=>{
            
            location.reload();
        }
        
    })
}

 


