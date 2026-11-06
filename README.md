<h1 align="center">Dharaneesh S</h1>

<p align="center">
  <b>Solution Engineer · Java, Spring Boot, React, TypeScript</b><br/>
  I build the backends and data-heavy frontends behind enterprise analytics apps, and I care about how fast the data gets from one to the other.
</p>

<br/>

## Open-source projects

### Columnwire: Apache Arrow instead of JSON from Spring Boot to React

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
  <a href="https://scorecard.dev/viewer/?uri=github.com/DHARANEESH-SRINIVASAN/columnwire"><img src="https://img.shields.io/ossf-scorecard/github.com/DHARANEESH-SRINIVASAN/columnwire?style=for-the-badge&label=OpenSSF%20Scorecard" alt="OpenSSF Scorecard"/></a>
  <a href="https://www.bestpractices.dev/projects/16203"><img src="https://img.shields.io/cii/level/16203?style=for-the-badge&label=OpenSSF%20Best%20Practices" alt="OpenSSF Best Practices"/></a>
  <a href="https://www.bestpractices.dev/projects/16203"><img src="https://www.bestpractices.dev/projects/16203/baseline" height="28" alt="OpenSSF Baseline"/></a>
</p>

<p><sub>Released on Maven Central and npm with GPG-signed artifacts, npm provenance in the Sigstore log, CodeQL on every change, property-based tests, and CI on JDK 17, 21 and 25.</sub></p>

<div data-stats="columnwire" align="center">

<a href="https://npm-stat.com/charts.html?package=columnwire"><img src="https://img.shields.io/badge/npm%20downloads-629-2f9e44?style=for-the-badge" alt="npm downloads: 629"/></a>
<img src="https://img.shields.io/badge/last%2030%20days-629-3b5bdb?style=for-the-badge" alt="last 30 days: 629"/> <img src="https://img.shields.io/badge/last%207%20days-629-7048e8?style=for-the-badge" alt="last 7 days: 629"/>

<sub>Downloads of <code>columnwire</code> from npm since Nov 2, 2026, data through Nov 5, 2026. npm counts every tarball fetch, so CI runs, mirrors and repeat installs are included. Maven Central publishes no public download counts.</sub>

</div>

```xml
<artifactId>columnwire-spring-boot-starter</artifactId>
```

```sh
npm install columnwire apache-arrow
```

New in 0.2.0: a controller can return a database query and Columnwire streams the JDBC `ResultSet` straight into Arrow, without a Java object per row. At 1,000,000 rows that is 603 ms instead of 3,721 ms for `queryForList` with Jackson, and the first bytes leave the server after 4 ms instead of 1.7 s. Checked value by value against PostgreSQL 18.

What went into it: a Spring MVC `HttpMessageConverter` that only answers when asked, so `*/*` and browser requests keep their JSON; `Vary: Accept` on both formats so caches stay correct; enums sent as Arrow dictionaries; a startup check that names the missing JVM flag instead of failing on the first request; a contract test that decodes Java-written Arrow in JavaScript and compares it value by value with Jackson's JSON; and CI on JDK 17, 21 and 25.

### Leapwire: a screen's whole chain of API calls in one round trip

<p>
  <a href="https://github.com/DHARANEESH-SRINIVASAN/leapwire"><b>Leapwire</b></a> removes request waterfalls without code changes. Most screens load their data as a chain, where each request needs a value from the previous answer. A Spring Boot starter learns those chains from ordinary traffic, whatever their length, shape or endpoint names, then answers the first request with every follow-up answer in one streamed response, fetched through the real Spring Security filter chain with the user's own credentials. A small npm package wraps <code>fetch</code> and serves the follow-ups from memory, in the browser and in React Native.
</p>

<p><a href="https://github.com/DHARANEESH-SRINIVASAN/leapwire">Source, protocol and benchmark</a></p>

| Measured example: an order screen whose 6 calls depend on each other, in Chrome | Without | With Leapwire |
|---|---:|---:|
| 150 ms round trip (mobile) | 945 ms | **294 ms** |
| 300 ms round trip | 1,687 ms | **443 ms** |
| 40 ms round trip | 382 ms | **187 ms** |
| Network requests | 6 | **1** |

<sub>Nothing is configured per endpoint: longer chains, branches and lists of ids are learned the same way, and a chain longer than the depth limit continues in the next response.</sub>

<p>
  <a href="https://central.sonatype.com/artifact/io.github.dharaneesh-srinivasan/leapwire-spring-boot-starter"><img src="https://img.shields.io/maven-central/v/io.github.dharaneesh-srinivasan/leapwire-spring-boot-starter?style=for-the-badge&label=Maven%20Central&color=c71a36" alt="Maven Central"/></a>
  <a href="https://www.npmjs.com/package/leapwire"><img src="https://img.shields.io/npm/v/leapwire?style=for-the-badge&label=npm&color=cb3837" alt="npm"/></a>
  <a href="https://github.com/DHARANEESH-SRINIVASAN/leapwire/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/DHARANEESH-SRINIVASAN/leapwire/ci.yml?style=for-the-badge&label=CI" alt="CI"/></a>
  <a href="https://scorecard.dev/viewer/?uri=github.com/DHARANEESH-SRINIVASAN/leapwire"><img src="https://img.shields.io/ossf-scorecard/github.com/DHARANEESH-SRINIVASAN/leapwire?style=for-the-badge&label=OpenSSF%20Scorecard" alt="OpenSSF Scorecard"/></a>
</p>

<div data-stats="leapwire" align="center">

<a href="https://npm-stat.com/charts.html?package=leapwire"><img src="https://img.shields.io/badge/npm%20downloads-326-2f9e44?style=for-the-badge" alt="npm downloads: 326"/></a>
<img src="https://img.shields.io/badge/last%2030%20days-326-3b5bdb?style=for-the-badge" alt="last 30 days: 326"/> <img src="https://img.shields.io/badge/last%207%20days-326-7048e8?style=for-the-badge" alt="last 7 days: 326"/>

<sub>Downloads of <code>leapwire</code> from npm since Nov 3, 2026, data through Nov 5, 2026. npm counts every tarball fetch, so CI runs, mirrors and repeat installs are included. Maven Central publishes no public download counts.</sub>

</div>

```xml
<artifactId>leapwire-spring-boot-starter</artifactId>
```

```sh
npm install leapwire
```

What went into it: a learner that finds which value in one JSON answer becomes the path or query of the next request, per screen, and only switches a rule on after enough pages from enough different users agree; speculative requests made over loopback HTTP so authorization runs exactly as for the browser; an NDJSON bundle that streams the first answer immediately; a client that returns that answer at once and lets later requests wait for answers already on the way; a byte-for-byte passthrough test for every request that does not opt in; and a headless Chrome benchmark behind a real round-trip delay proxy.

## What I work with

<p>
  <img src="https://skillicons.dev/icons?i=java,spring,maven,react,ts,js,nodejs,vite,git,github,githubactions" alt="Java, Spring, Maven, React, TypeScript, JavaScript, Node.js, Vite, Git, GitHub, GitHub Actions"/>
</p>

- **Backend:** Java 17 to 25, Spring Boot, Spring MVC, REST APIs, Maven, JMH
- **Frontend:** React, TypeScript, Vite, virtualized data grids, data-heavy dashboards
- **Data:** Apache Arrow, JDBC streaming, Parquet, columnar formats, streaming large result sets to the browser
- **Web performance:** request waterfalls, streaming responses, NDJSON, measuring in real browsers

<p align="center"><sub>Every number above comes from the benchmarks in the Leapwire and Columnwire repositories and can be reproduced with their commands.</sub></p>
