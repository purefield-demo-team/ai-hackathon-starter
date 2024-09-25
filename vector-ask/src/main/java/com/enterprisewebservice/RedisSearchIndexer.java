package com.enterprisewebservice;

import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.stream.Collectors;

import com.enterprisewebservice.embeddings.EmbeddingData;
import com.enterprisewebservice.embeddings.EmbeddingResponse;

import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPooled;
import redis.clients.jedis.exceptions.JedisDataException;
import redis.clients.jedis.search.Document;
import redis.clients.jedis.search.IndexDefinition;
import redis.clients.jedis.search.IndexOptions;
import redis.clients.jedis.search.Query;
import redis.clients.jedis.search.Schema;
import redis.clients.jedis.search.SearchResult;
import redis.clients.jedis.search.schemafields.VectorField;



public class RedisSearchIndexer {
    private JedisPooled jedis;
    private JedisPool jedisPool;
    private static final String VECTOR_DIM = "1536";
    private static final String VECTOR_NUMBER = "1600";
    private static final String INDEX_NAME = "nizer5-embeddings";
    //private static final String PREFIX = "goalora:";
    private static final String DISTANCE_METRIC = "COSINE";

    public RedisSearchIndexer(JedisPooled jedis, JedisPool jedisPool) {
        this.jedis = jedis;
        this.jedisPool = jedisPool;
    }

   public void createIndex( ) {

        // Define the default algorithm
        VectorField.VectorAlgorithm defaultAlgorithm = VectorField.VectorAlgorithm.FLAT;

        // Set defaultAttributes for the embedding_vector field
        Map<String, Object> defaultAttributes = new HashMap<>();
        defaultAttributes.put("TYPE", "FLOAT32");
        defaultAttributes.put("DIM", VECTOR_DIM);
        defaultAttributes.put("DISTANCE_METRIC", DISTANCE_METRIC);
        defaultAttributes.put("INITIAL_CAP", VECTOR_NUMBER);
        Schema sc = new Schema().addFlatVectorField("embedding", defaultAttributes);
        sc.addTextField("subjectsearch",1.0);

        // Define the prefixes
        IndexOptions indexOptions = IndexOptions.defaultOptions();
        IndexDefinition indexDefinition = new IndexDefinition();
        indexDefinition.setScore(0);
        indexDefinition.setPrefixes("doc:"); // set your prefix here
        indexOptions.setDefinition(indexDefinition);
        

        try {
            var query = new Query("*");
            jedis.ftSearch(INDEX_NAME, query);
            System.out.println("Index already exists");
        } catch (JedisDataException ex) {
            // Create the index
            jedis.ftCreate(INDEX_NAME, indexOptions, sc);
            // jedis.ftCreate(
            //     INDEX_NAME + keycloakSubject,
            //     FTCreateParams.createParams()
            //         .on(IndexDataType.JSON)
            //         .addPrefix(keycloakSubject),
            //     TextField.of("$.index").as("index"),
            //     TextField.of("$.object").as("object"),
            //     VectorField.builder().fieldName("$.embedding").algorithm(defaultAlgorithm).attributes(defaultAttributes).build().as("embedding")
            //);
            System.out.println("Index created successfully");
        }
    }

    // public void createIndex() {
    //     // Define the default algorithm
    //     //VectorField.VectorAlgorithm defaultAlgorithm = VectorField.VectorAlgorithm.FLAT;

    //     // Set defaultAttributes for the embedding_vector field
    //     Map<String, Object> defaultAttributes = new HashMap<>();
    //     defaultAttributes.put("TYPE", "FLOAT32");
    //     defaultAttributes.put("DIM", VECTOR_DIM);
    //     defaultAttributes.put("DISTANCE_METRIC", DISTANCE_METRIC);
    //     defaultAttributes.put("INITIAL_CAP", VECTOR_NUMBER);

    //     try {
    //         jedis.sendCommand(new ProtocolCommand() {
    //             @Override
    //             public byte[] getRaw() {
    //                 return SafeEncoder.encode("FT.CREATE");
    //             }}, 
    //             SafeEncoder.encode(INDEX_NAME),  // replace INDEX_NAME with your index name
    //             SafeEncoder.encode("ON"), SafeEncoder.encode("JSON"), 
    //             SafeEncoder.encode("PREFIX"), SafeEncoder.encode("1"), SafeEncoder.encode("doc:"),
    //             SafeEncoder.encode("SCHEMA"), 
    //             SafeEncoder.encode("$.index"), SafeEncoder.encode("TEXT"),
    //             SafeEncoder.encode("$.object"), SafeEncoder.encode("TEXT"),
    //             SafeEncoder.encode("$.subject"), SafeEncoder.encode("TEXT"),
    //             SafeEncoder.encode("$.embedding"), SafeEncoder.encode("VECTOR"),
    //             SafeEncoder.encode("TYPE"), SafeEncoder.encode("FLOAT32"),
    //             SafeEncoder.encode("DIM"), SafeEncoder.encode(String.valueOf(VECTOR_DIM)), // replace VECTOR_DIM with your vector dimension
    //             SafeEncoder.encode("DISTANCE_METRIC"), SafeEncoder.encode(DISTANCE_METRIC), // replace DISTANCE_METRIC with your distance metric
    //             SafeEncoder.encode("INITIAL_CAP"), SafeEncoder.encode(String.valueOf(VECTOR_NUMBER))  // replace VECTOR_NUMBER with your vector initial capacity
    //         );
    //         System.out.println("Index created successfully");
    //     } catch (JedisDataException ex) {
    //         System.out.println("Index already exists");
    //     }
    // }



    // public void indexEmbeddings(EmbeddingResponse embeddingResponse, String customKey, String title, String description, String keycloakSubject) {
    //     ObjectMapper mapper = new ObjectMapper();
    //     for (EmbeddingData embeddingData : embeddingResponse.getData()) {
    //         String key = "doc:" + customKey + "-" + embeddingData.getIndex(); // Added "doc:" prefix

    //         // Create a new JSON document
    //         Map<String, Object> document = new HashMap<>();
    //         document.put("index", embeddingData.getIndex());
    //         document.put("title", title);
    //         document.put("description", description);
    //         document.put("subject", keycloakSubject);
    //         document.put("embedding", embeddingData.getEmbedding()); // Assuming the embedding is a list of floats, not a byte array.

    //         // Convert the map to a JSON string
    //         String jsonDocument = null;
    //         try {
    //             jsonDocument = mapper.writeValueAsString(document);
    //         } catch (JsonProcessingException e) {
    //             // TODO Auto-generated catch block
    //             e.printStackTrace();
    //         }
            
    //         // Store the JSON document in Redis
    //         jedis.sendCommand(new ProtocolCommand() {
    //             @Override
    //             public byte[] getRaw() {
    //                 return SafeEncoder.encode("JSON.SET");
    //             }},
    //             SafeEncoder.encode(key),
    //             SafeEncoder.encode("."),
    //             SafeEncoder.encode(jsonDocument)
    //         );
    //     }
    // }

    public void indexEmbeddings(EmbeddingResponse embeddingResponse, String customKey, List<String> texts, String keycloakSubject) {
        for (EmbeddingData embeddingData : embeddingResponse.getData()) {
            String key = "doc:" + customKey + "-" + embeddingData.getIndex();
            
            // Convert embeddings to byte arrays
            byte[] embedding = null;
            try {
                System.out.println("embedding: " + embeddingData.getEmbedding().toString() + " " + embeddingData.getEmbedding().size());
                embedding = floatArrayToBytesLittleEndianOrder(embeddingData.getEmbedding().toArray(new Float[0]));
            } catch (IOException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
            

            // Create a new hash in Redis for the document
            Map<byte[], byte[]> hash = new HashMap<>();
            hash.put("index".getBytes(), Integer.toString(embeddingData.getIndex()).getBytes());
            //hash.put("title".getBytes(), title.getBytes());
            //hash.put("description".getBytes(), description.getBytes());
            hash.put("embedding".getBytes(), embedding);
            //hash.put("subject".getBytes(), keycloakSubject.ge);
            
            jedis.hset(key.getBytes(), hash);
            jedis.hset(key, "subject", keycloakSubject);
            jedis.hset(key, "subjectsearch", keycloakSubject.replaceAll("-", ""));
            jedis.hset(key, "title", customKey);
            jedis.hset(key, "description", texts.get(embeddingData.getIndex()));
        }
    }


    public void deleteEmbedding(String customKey) {
        for (int i = 0; i < 5; i++) {
            String key = customKey + "-" + i;
            System.out.println("Deleting key: " + key);
            jedis.del(key.getBytes());
        }
    }

    public void dropIndex(String indexName)
    {
        jedis.ftDropIndex(indexName);
    }

    public void deleteDocuments()
    {
        jedis.flushAll();
    }

    public static byte[] floatArrayToBytesLittleEndianOrder(Float[] vector) throws IOException {
        ByteArrayOutputStream bas = new ByteArrayOutputStream();
        DataOutputStream dos = new DataOutputStream(bas);
        for (float f : vector) {
            byte[] bytes = getBytesLittleEndianOrder(f);
            dos.write(bytes);
        }
        return bas.toByteArray();
    }

    private static byte[] getBytesLittleEndianOrder(float f) {
        int intBits =  Float.floatToIntBits(f);
        return new byte[]{(byte) (intBits), (byte) (intBits >> 8), (byte) (intBits >> 16), (byte) (intBits >> 24)};
    }
    

    public List<Document> vectorSimilarityQuery(String keycloakSubject, EmbeddingResponse queryEmbedding) {
        List<Document> documents = null;
        // Use the "embedding" field in Redis as vectorKey
        String vectorKey = "embedding";

        // Assuming that the EmbeddingResponse contains multiple EmbeddingData 
        // each of which includes the embeddings of the query article.
        List<EmbeddingData> queryEmbeddingData = queryEmbedding.getData();
       
        // Convert the query vector to a byte array for each embedding and execute the query.
        Entry<SearchResult, Map<String, Object>> result = null;
        for (EmbeddingData eData : queryEmbeddingData) {
            
            // Convert the query vector to a byte array
            
            byte[] queryVector = null;
            try {
                queryVector = floatArrayToBytesLittleEndianOrder(eData.getEmbedding().toArray(new Float[0]));
            } catch (IOException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }

            String keycloakSubjectSearch = keycloakSubject.replaceAll("-", "");
            System.out.println("keycloaksubject in searchQuery: " + keycloakSubject);
            String hybridFields = "(@subjectsearch:" + keycloakSubjectSearch +")";
            //String hybridFields = "*";
            String searchQueryText = hybridFields + "=>[KNN 30 @embedding $vector]";

            // Create a new search query
            Query searchQuery = new Query(searchQueryText)
                                        //.addParam("subject", keycloakSubject.replaceAll("-", ""))
                                        .addParam("vector", queryVector)
                                        .setSortBy("__" + vectorKey + "_score", true)
                                        .returnFields("title", "description", "__" + vectorKey + "_score", "subjectsearch")
                                        .dialect(2);
            //Query searchQuery = new Query(hybridFields);
            searchQuery.setWithScores();
            System.out.println("getting with scores?: " + searchQuery.getWithScores());
            System.out.println("Search query: " + searchQueryText);
            System.out.println("Searchsubject: " + keycloakSubjectSearch);
            // Execute the search query
            SearchResult searchResult = jedis.ftSearch(INDEX_NAME, searchQuery);
            searchResult.getDocuments().forEach(doc -> System.out.println(doc.getString("title") + " " + doc.get("__" + vectorKey + "_score")));
            documents = searchResult.getDocuments();
        }

        return documents;
    }

    public List<String> toListString(List<Float> vector) {
        return vector.stream()
                     .map(Object::toString)
                     .collect(Collectors.toList());
    }

    public String getMessage(List<Document> documents) {
        // Convert the search results to a list of EmbeddingData
        StringBuffer message = new StringBuffer();
        
        int i = 0;
        System.out.println("Number of documents: " + documents.size());
        // While there are still documents and the message doesn't exceed the limit
        while (i < documents.size() && message.length() < 7500) {
            Document doc = documents.get(i);
            
            // Get the index, object, and embedding from the document
            String title = "article " + i + ": " + doc.getString("title");
            String description = "description: " + doc.getString("description");
            String part = title + "\n" + description + "\n";
            System.out.println(part);
            // Check if adding the next part would exceed the limit
            if (message.length() + part.length() <= 7500) {
                // If it wouldn't, append the part
                message.append(part);
            }

            // Increment the index
            i++;
        }
        
        return message.toString();
    }


    private byte[] toByteArray(List<Float> list) {
        ByteBuffer byteBuffer = ByteBuffer.allocate(Float.SIZE / Byte.SIZE * list.size());

        for (float val : list) {
            byteBuffer.putInt(Float.floatToIntBits(val));
        }

        byte[] byteArray = byteBuffer.array();

        // Printing the byte array for testing
        return byteArray;
    }
}