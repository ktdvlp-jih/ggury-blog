---
templateKey: blog-post
draft: false
title: springboot 게시글 등록 화면 만들기
date: 2022-08-15T02:57:06.599Z
category: SpringBoot
description: SpringBoot 게시글 등록 화면 만들기
tags: 
- SpringBoot
---
# **게시글 등록 화면 만들기**
앞에서는 PostsApiController로 API를 구성했으나 여기선 바로 화면으로 개발하겠습니다.
HTML이 아닌 부트스트랩을 통해 화면을 구성해 보도록 하겠습니다. 프론트엔드 라이브러리를 사용할 수 있는 방법은 외부 CDN 혹은 직접 라이브러리를 받아서 사용 하는 방식이 있는데
외부가 아니 안정적으로 이용하기 위해 내부로 내려받아 사용해 보도록 하겠습니다.
https://mafa.tistory.com/entry/5-Spring-Boot%EC%97%90-BootStrap-%EC%A0%81%EC%9A%A9%ED%95%98%EA%B8%B0?category=1020270 해당 부분이 정리가 잘되어있어서 이부분을 참고해 주시면 되겠습니다.


### **header,footer레이아웃 작성**
templates디렉토리에 header,footer.mustache파일을 생성합니다.
기본적으로 css는 화면을 먼저 그리기 때문에 head부분에 넣고 body부분은 head부분이 실행이 완료된후에 실행되기에 js를 적용했습니다.
css와 js는 파일 위치마다 경로가 달라질수 있으니 주의 해주세요
header와footer부분에 사용하지 않는 css와 script가 작성되어 있지만 이부분은 그냥 넘어가도록 하겠습니다.(주석처리)

### **header.mustache**
```html
<!DOCTYPE html>
<html lang="en">
<head>

    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="">
    <meta name="author" content="">

    <!-- Custom styles for this template-->
    <link rel="stylesheet" href="/css/sb-admin-2.min.css">
    <!-- Custom fonts for this template-->
    <link href="/vendor/fontawesome-free/css/all.min.css" rel="stylesheet" type="text/css">
    <link href="https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i" rel="stylesheet">

    <title>스프링 부트 웹 서비스</title>

</head>
<body>
```
### **footer.mustache**
```html
<!-- Bootstrap core JavaScript-->
<script src="/vendor/jquery/jquery.min.js"></script>
<script src="/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>

<!-- Core plugin JavaScript-->
<script src="/vendor/jquery-easing/jquery.easing.min.js"></script>

<!-- Custom scripts for all pages-->
<script src="/js/b-admin-2.min.js"></script>
<script src="/js/app/index.js"></script>

<!-- Page level plugins -->
<script src="/vendor/chart.js/Chart.min.js"></script>

<!-- Page level custom scripts -->
<!--<script src="/js/demo/chart-area-demo.js"></script>-->
<!--<script src="/js/demo/chart-pie-demo.js"></script>-->

<!--<script src="/static/js/jquery-3.6.0.min.js"></script>-->
<!--<script src="/static/js/sb-admin-2.min.js"></script>-->
</body>
</html>
```

### **index.mustache**
{{>layout/header}},{{>layout/footer}} 해당 부분은 매번 사용되는 레이아웃을 불러오는 코드 입니다.
Bootstrap에서 지원하는 css를 통해 코드를 작성해 보았습니다.
a태그에서 /posts/save 라는 경로로 이동하도록 만들어 놨는데 이부분은 나중에 IndexController에서 처리하겠습니다.
```html
{{>layout/header}}
<h1>스프링 부트로 시작하는 웹서비스 Ver.2</h1>
<div class="col-md-12">
    <div class="row">
        <div class="col-md-6">
            <a href="/posts/save" role="button" class="btn btn-primary">글 등록</a>
        </div>
    </div>
</div>
{{>layout/footer}}
```

### **posts-save.mustache**
게시글을 작성할수있는 공간이며 등록 버튼을 통해 데이터를 게시판에 등록 할 수 있습니다.
![게시글-등록](/assets/게시글-등록.png "게시글-등록")
```html
{{>layout/header}}
<h1>게시글 등록</h1>
<div class="col-md-12">
    <div class="col-md-4">
        <form>
            <div class="form-group">
                <label for="title">제목</label>
                <input type="text" class="form-control" id="title" placeholder="제목을 입력하세요">
            </div>
            <div class="form-group">
                <label for="author">작성자</label>
                <input type="text" class="form-control" id="author" placeholder="작성자를 입력하세요">
            </div>
            <div class="form-group">
                <label for="content">내용</label>
                <textarea class="form-control" id="content" placeholder="내용을 입력하세요"></textarea>
            </div>
        </form>
        <a href="/" role="button" class="btn btn-secondary">취소</a>
        <button type="button" class="btn btn-primary" id="btn-save">등록</button>
    </div>
</div>
{{>layout/footer}}
```

이후 h2-console을 접속해 실제 DB로 데이터가 등록되었는지 확인 할수 있습니다.
![게시글-등록-성공](/assets/게시글-등록-성공.png "게시글-등록-성공")