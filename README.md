<h1 align="center">Dharaneesh S</h1>

<p align="center">
  <b>Solution Engineer · Java, Spring Boot, React, TypeScript</b><br/>
  I build the backends and data-heavy frontends behind enterprise analytics apps, and I care about how fast the data gets from one to the other.
</p>

<br/>

## Featured: Columnwire

<p>
  <a href="https://github.com/DHARANEESH-SRINIVASAN/columnwire"><b>Columnwire</b></a> sends tables from Spring Boot to React as <a href="https://arrow.apache.org/">Apache Arrow</a> instead of JSON. Existing endpoints stay untouched: clients that ask for Arrow get columnar record batches streamed as they are encoded, everyone else keeps getting JSON. On the React side a hook and a virtualized grid read the columns straight out of the Arrow buffers.
</p>

<p><a href="https://dharaneesh-srinivasan.github.io/columnwire/"><b>▶ Live demo</b></a> · <a href="https://github.com/DHARANEESH-SRINIVASAN/columnwire">Source and benchmarks</a></p>

| Measured on 1,000,000 rows | JSON | Columnwire |
|---|---:|---:|
| Encoding in Spring Boot (JMH) | 643 ms | **154 ms** |
| Garbage created per response | 576 MB | **58 MB** |
| Over the wire, gzip | 39.2 MB | **26.5 MB** |
| First rows on screen in Chrome | 6,573 ms | **103 ms** |

<p>
  <a href="https://central.sonatype.com/artifact/io.github.dharaneesh-srinivasan/columnwire-spring-boot-starter"><img src="https://img.shields.io/maven-central/v/io.github.dharaneesh-srinivasan/columnwire-spring-boot-starter?style=for-the-badge&label=Maven%20Central&color=c71a36" alt="Maven Central"/></a>
  <a href="https://www.npmjs.com/package/columnwire"><img src="https://img.shields.io/npm/v/columnwire?style=for-the-badge&label=npm&color=cb3837" alt="npm"/></a>
  <a href="https://github.com/DHARANEESH-SRINIVASAN/columnwire/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/DHARANEESH-SRINIVASAN/columnwire/ci.yml?style=for-the-badge&label=CI" alt="CI"/></a>
</p>

<div data-stats="columnwire" align="center">

<sub>The npm package is not published yet. Download counts appear here the day after the first release.</sub>

</div>

```xml
<artifactId>columnwire-spring-boot-starter</artifactId>
```

```sh
npm install columnwire apache-arrow
```

What went into it: a Spring MVC `HttpMessageConverter` that only answers when asked, so `*/*` and browser requests keep their JSON; `Vary: Accept` on both formats so caches stay correct; enums sent as Arrow dictionaries; a startup check that names the missing JVM flag instead of failing on the first request; a contract test that decodes Java-written Arrow in JavaScript and compares it value by value with Jackson's JSON; and CI on JDK 17, 21 and 25.

## What I work with

<p>
  <img src="https://skillicons.dev/icons?i=java,spring,maven,react,ts,js,nodejs,vite,git,github,githubactions" alt="Java, Spring, Maven, React, TypeScript, JavaScript, Node.js, Vite, Git, GitHub, GitHub Actions"/>
</p>

- **Backend:** Java 17 to 25, Spring Boot, Spring MVC, REST APIs, Maven, JMH
- **Frontend:** React, TypeScript, Vite, virtualized data grids, data-heavy dashboards
- **Data:** Apache Arrow, Parquet, columnar formats, streaming large result sets to the browser

<p align="center"><sub>Every number above comes from the benchmarks in the Columnwire repository and can be reproduced with its commands.</sub></p>
