---
templateKey: blog-post
draft: false
title: springboot 게시글 수정-삭제 화면 만들기
date: 2022-08-16T20:10:06.599Z
category: SpringBoot
description: SpringBoot 게시글 수정-삭제 화면 만들기
tags: 
- SpringBoot
---
# **게시글 수정ㅡ삭제 화면 만들기**
index.mustache에서 목록을 출력하는 부분을 추가해보겠습니다.
## **\-posts-update.mustache-**
```html
{{>layout/header}}
<h1>게시글 등록</h1>
<div class="col-md-12">
  <div class="col-md-4">
    <form>
      <div class="form-group">
        <label for="id">글 번호</label>
        <!--mustache는 객체의 필드 접근식 dot으로 구분 (즉, Post 클래스의 id에 대한 접근은 post.id로 사용 가능)-->
        <input type="text" class="form-control" id="id" value="{{post.id}}" readonly>
      </div>
      <div class="form-group">
        <label for="title">제목</label>
        <input type="text" class="form-control" id="title" value="{{post.title}}">
      </div>
      <div class="form-group">
        <label for="author">작성자</label>
        <!--readonly input태크에서 읽기만 가능케 하는 속성 수정하면 안되는곳에 readonly속성 사용 -->
        <input type="text" class="form-control" id="author" value="{{post.author}}" readonly>
      </div>
      <div class="form-group">
        <label for="content">내용</label>
        <textarea class="form-control" id="content">{{post.content}}</textarea>
      </div>
    </form>
    <a href="/" role="button" class="btn btn-secondary">취소</a>
    <button type="button" class="btn btn-primary" id="btn-update">수정</button>
    <button type="button" class="btn btn-danger" id="btn-delete">삭제</button>
  </div>
</div>
{{>layout/footer}}
```
## **\-btn-update-**
* 수정 버튼

* ## **\-btn-delete-**
* 삭제 버튼

* ## **\-post.id-**
* Post클래스의 id접근

* ## **\-readonly-**
* 수정하면 안되는 목록은 읽기 기능만 허용하는 속성

## **\-PostsApiController-**
수정 삭제를 할수 있는 Api를 추가하겠습니다.

```java
    @PutMapping("/api/v1/posts/{id}") // 데이터 업데이트 (HTTP PUT 요청)
    public Long update(@PathVariable Long id, @RequestBody PostsUpdateRequestDto requestDto) {
        return postsService.update(id,requestDto);
    }

    @DeleteMapping("/api/v1/posts/{id}") // 데이터 삭제 (HTTP Deletd 요청)
    public Long delete(@PathVariable Long id) {
        postsService.delete(id);
        return id;
    }
```

## **\-IndexController-**
```java

    @RequestMapping("/posts/update/{id}")
    public String postsUpdate(@PathVariable Long id, Model model) {
        PostsResponseDto dto = postsService.findById(id);
        model.addAttribute("post", dto);
        return "posts-update";
    }

    @RequestMapping("/")
    public String index(Model model) {
        model.addAttribute("posts", postsService.findAllDesc());
        return "index";
    }
    
```

### **@PathVariable**
* URL에 변수 사용을 가능케함

### **Model**
* model 서버 템플릿 엔진에서 사용할 수 있는 객체를 저장 (postsService.findAllDesc()로 가져온 결과를 posts로 index.mustache에 전달)

```js

// 글 수정
$('#btn-update').on('click', function () {
  _this.update();
})
// 글 삭제
$('#btn-delete').on('click', function () {
  _this.delete();
})

update: function () {
  var data = {
    title: $('#title').val(),
    content: $('#content').val()
  };

  var id = $('#id').val(); //ID 값

  $.ajax({
    type: 'PUT', // PUT 수정
    url: '/api/v1/posts/'+id, // 어떤 게시글을 수정할지 URL Path로 구분하기위해 id추가
    dataType: 'json',
    contentType: 'application/json; charset=utf-8',
    data: JSON.stringify(data)
  }).done(function () {
    alert("글이 수정되었습니다."); //성공 메세지 출력
    window.location.href = '/'; // 글 등록이 성공하면 메인페이지('/')로 이동
  }).fail(function (error) {
    alert(JSON.stringify(error)); //실패 메세지 출력
  })
},
delete: function () {

  var id = $('#id').val(); //ID 값

  $.ajax({
    type: 'DELETE', // PUT 수정
    url: '/api/v1/posts/'+id, // 어떤 게시글을 수정할지 URL Path로 구분하기위해 id추가
    dataType: 'json',
    contentType: 'application/json; charset=utf-8',
  }).done(function () {
    alert("글이 삭제되었습니다."); //성공 메세지 출력
    window.location.href = '/'; // 글 등록이 성공하면 메인페이지('/')로 이동
  }).fail(function (error) {
    alert(JSON.stringify(error)); //실패 메세지 출력
  })
}
```
기존 등록 부분 영역에 수정,삭제 기능을 추가

## **\-index.mustache-**
```html

    <tbody id="tbody">
    {{#posts}} <!--posts라는 List를 순회 (for문)-->
        <tr>
            <td>{{id}}</td> <!--List에서 뽑아낸 객체의 필드명-->
            <td><a href="/posts/update/{{id}}" role="button">{{title}}</a></td>
            <td>{{author}}</td>
            <td>{{modifiedDate}}</td>
        </tr>
    {{/posts}}
    </tbody>
```
마지막으로 게시판 목록에서 수정페이지로 이동할수 있도록 <a href="이동할 URL""></a>를 추가 합니다.

## **\-PostsService-**
```java

    @Transactional
    public Long update(Long id, PostsUpdateRequestDto requestDto) {
        // orElseThrow() 메소드: 저장된 값이 존재하면 그값을 반환하고 값이 존재하지 않으면 인수로 전달된 예를를 발생시킵니다.
        // IllegalArgumentException() 메소드: 적합하지 않거나 저절하지 못한 인자를 메소드에 넘겨주었을때 반환
        Posts posts = postsRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("해당 게시글이 없습니다. id = " + id));

        // 여기서 쿼리를 날리지 않고 Repository를 통해 수정하고자하는 게시판Post를 가져옵니다
        // 중요한 부분인데 JPA의 영속성 컨텍스트(Entity 영구저장) 때문에 데이터 값을 변경하면 트랜잭션이 끝나는 시점에 해당 테이블에 변경부을 반영 (즉 Entity 객체값만 변경하면 update쿼리를 날릴필요 없음)
        // JPA는 트랜잭션이 끝나는 시점 변화가 있는 모든 Entity를 데이터베이스에 자동 반영합니다.
        // https://jojoldu.tistory.com/415 (dirty checking) 확인
        posts.update(requestDto.getTitle(), requestDto.getContent());

        return id;
    }
    @Transactional
    public void delete(Long id) {
        Posts posts = postsRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("해당 게시글이 없습니다. id = " + id));
        postsRepository.delete(posts);
    }
    
```
PostsService를 통해 update와 delete 메소드를 컨트롤러가 사용할수 있도록 코드를 추가해줍니다.

## **\-테스트 코드 결과-**
게시글 수정
![게시글-수정](/assets/게시글-수정.png "게시글-수정")
게시글 수정 성공
![게시글-수정-성공](/assets/게시글-수정-성공.png "게시글-수정-성공")
게시글 삭제 성공
![게시글-삭제-성공](/assets/게시글-삭제-성공.png "게시글-삭제-성공")