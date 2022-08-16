---
templateKey: blog-post
draft: false
title: springboot 전체 조회 화면 만들기
date: 2022-08-15T02:57:06.599Z
category: SpringBoot
description: SpringBoot 전체 조회 화면 만들기
tags: 
- SpringBoot
---
# **전체 조회 화면 만들기**
index.mustache에서 목록을 출력하는 부분을 추가해보겠습니다.
### **header.mustache**
```html
<br/>
<!--목록 출력 영역-->
<table class="table table-horizontal table-bord"></table>
```


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
목록 출력 영역 부분인 table ( 작성 게시판번호,제목,작성자,작성일자 )
  1. {{#posts}}: List순회, 자바의 for문과 동일
  2. {{id}}: List에서 뽑아낸 객체의 필드명
```html
{{>layout/header}}
<h1>스프링 부트로 시작하는 웹서비스</h1>
<div class="col-md-12">
    <div class="row">
        <div class="col-md-6">
            <a href="/posts/save" role="button" class="btn btn-primary">글 등록</a>
        </div>
    </div>
</div>
<br/>
<!--목록 출력 영역-->
<table class="table table-horizontal table-bordered">
    <thead class="thead-strong">
    <tr>
        <th>게시글 번호</th>
        <th>제목</th>
        <th>작성자</th>
        <th>최종수정일</th>
    </tr>
    </thead>
    <tbody id="tbody">
    {{#posts}} <!--posts라는 List를 순회 (for문)-->
    <tr>
        <td>{{id}}</td> <!--List에서 뽑아낸 객체의 필드명-->
        <td>{{title}}</td>
        <td>{{author}}</td>
        <td>{{modifiedDate}}</td>
    </tr>
    {{/posts}}
    </tbody>
</table>
{{>layout/footer}}
```
이후 Controller,Sevice,Repository코드 작성

### **PostsRepository**
```java
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
/*
 * Posts 클래스로 Database 접근하게 도와줄 JpaRepository, DB Layer 접근자, 인터페이스로 생성
 * JpaRepository<Entity클래스,PK타입>를 상속하면 기본적인 CRUD메소드가 자동생성됨
 * */
public interface PostsRepository extends JpaRepository<Posts,Long> {
    @Query("SELECT p FROM Posts p ORDER BY p.id DESC") // Posts게시판을 id기준으로 내림차순
    List<Posts> findAllDesc();
}
```
여기선 SpringDataJpa에서 제공하지 않는 메소드로 @Query를 사용
규모가 있는 프로젝트에서 데이터 조회는 FK의 조인, 복잡한 조건 등으로 인해 이런 Entity클래스만으로 처리하기 어려워 조회용 프레임 워크를 따로 추가합니다
대표적으로 querydsl,jooq,MyBatis등이 있는데 대표적으로 조희는 querydsl 이것을 사용하고 등록/수정/삭제 등은 SpringDataJpa를 통해 진행합니다.

### **PostsService**
```java
@RequiredArgsConstructor // 생성자 (선언된 모든 final필드가 포함된 생성자 생성 (final이 없는 필드는 생성자에 포함되지 않음))
@Service // 알맞은 정보를 가공 -> 비즈니스 로직을 수행 -> DB에접근하는 DAO(sql문을 실행할 수 잇는 객체 )이용해서 결과값을 받아옴
public class PostsService {
    private final PostsRepository postsRepository;

    @Transactional(readOnly = true)
    public List<PostsListResponseDto> findAllDesc() {
        return postsRepository.findAllDesc().stream()
                .map(PostsListResponseDto::new)
                .collect(Collectors.toList());
    }
}
```
PostsRepository에서 만들 메소드 findAllDesc의 트랜잭션 어노테이션에 옵셔이 추가 되고
(readOnly=true)를 주면 트랜잭션 범위는 유지하되 조회 기능만 남겨두고 조회 속도가 개선 되기에 등록,삭제,수정 기능이 전혀 없는 서비스 메소드에서 
사용하면 좋습니다.
.map(PostsListResponseDto::new)는 .map(posts -> new PostsListResponseDto(posts) 이것과 뜻이 똑같습니다.
postsRepository 결과로 넘어온 Posts의 Stream을 map을 통해 PostsListResponseDto변환 -> List로 반환 하는 메소드

### **PostsListResponseDto**
```java
@Getter
public class PostsListResponseDto {
    private Long id;
    private String title;
    private String author;
    private LocalDateTime modifiedDate;

    public PostsListResponseDto(Posts entity) {
        this.id = entity.getId();
        this.title = entity.getTitle();
        this.author = entity.getAuthor();
        this.modifiedDate = entity.getModifiedDate();
    }
}
```
DB에서 꺼낸 데이터를 저장하는 Entity (DTO)

### **IndexController**
```java

private final PostsService postsService;

@Getter
public class PostsListResponseDto {
    @RequestMapping("/")
    public String index(Model model) {
        model.addAttribute("posts", postsService.findAllDesc());
        return "index";
    }
}
```
Model: model 서버 템플릿 엔진에서 사용할 수 있는 객체를 저장 (postsService.findAllDesc()로 가져온 결과를 posts로 index.mustache에 전달)

## **\-테스트 코드 결과-**
![spring-웹-계층](/assets/spring-웹-계층.png "spring-웹-계층")
























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