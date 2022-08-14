---
templateKey: blog-post
draft: false
title: SpringBoot JPA Auditing으로 생성//수정시간 자동화
date: 2022-08-12T16:09:34.830Z
category: springboot
description: Entity에는 데이터의 생성/수정시간이 포함되어 있는데 매번 DB에 삽입하고 갱신 하기전 등록/수정하는 코드가 들어가게
  되는데 이러한 반복적인 코드를 해결하는 방법인 JPA Auditing을 사용해 보겠습니다.
---
domain패키지에 BaseTimeEntity 클래스를 생성하겠습니다.

```
package com.example.book.springboot.web.domain;

/*
 * JPA Auditing으로 생성/수정시간 자동화
 *  BaseTimeEntity는 모든 Entity의 상위 클래스가 되서 createdDate,modifiedDate를 자동관리하는 역할
 * */

import lombok.Getter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.EntityListeners;
import javax.persistence.MappedSuperclass;
import java.time.LocalDateTime;

@Getter
@MappedSuperclass // 1. Entity클래스들이 BaseTimeEntity를 상속할 경우 필드에 있는 createdDate,modifiedDate도 칼럼으로 본인의 칼럼으로 인식
@EntityListeners(AuditingEntityListener.class) // 2. BaseTimeEntity클래스에 Auditing기능을 포함시킴
public class BaseTimeEntity {

    @CreatedDate // 3. Entitiy가 생성되어 저장될때 시간이 나중 저장
    private LocalDateTime createdDate; 

    @LastModifiedDate // 4. 조회한 Entitiy의 값이 변경할때 시간이 자동 저장
    private LocalDateTime modifiedDate;
}
```

### BaseTimeEntity 클래스

* ##### @MappedSuperclass: Eintity클래스들이 BaseTimeEntity를 상속할 경우 필드들도 칼럼으로 인식하도록 만들어 줍니다.
* ##### EintityListeners(AuditingEntityListenner.class):